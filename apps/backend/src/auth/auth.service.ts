import { Injectable, Logger } from '@nestjs/common';
import bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { User } from './interfaces/user.interface';

const GENERIC_RESEND_MESSAGE =
  'Si el correo está registrado y pendiente de verificación, te enviamos un enlace.';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private getExpiryDate() {
    const hours = Number(
      this.config.get<string>('EMAIL_VERIFICATION_EXPIRES_HOURS') ?? 48,
    );
    const safeHours = Number.isFinite(hours) && hours > 0 ? hours : 48;
    return new Date(Date.now() + safeHours * 60 * 60 * 1000);
  }

  /**
   * Replaces any pending token for the user and emails the new one.
   * A failing email provider must not roll back the registration: the account
   * already exists and the user can request a new link.
   */
  private async issueVerificationToken(user: {
    user_id: number;
    email: string;
    name: string;
  }) {
    const token = crypto.randomBytes(32).toString('hex');

    await this.prisma.emailVerificationToken.deleteMany({
      where: { user_id: user.user_id },
    });

    await this.prisma.emailVerificationToken.create({
      data: {
        user_id: user.user_id,
        token_hash: this.hashToken(token),
        expires_at: this.getExpiryDate(),
      },
    });

    try {
      await this.mailService.sendVerificationEmail(user.email, user.name, token);
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el correo de verificación a ${user.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException({
          message: 'El correo electrónico ya está registrado',
          field: 'email',
        });
      }

      if (existingUser.username === username) {
        throw new ConflictException({
          message: 'El nombre de usuario ya está registrado',
          field: 'username',
        });
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name.trim(),
        username,
        last_name: dto.last_name ? dto.last_name.trim() : dto.last_name,
        role: {
          connect: { role_name: 'USER' },
        },
        password: hashedPassword,
      },
      include: { role: true },
    });

    await this.issueVerificationToken(user);

    return {
      message:
        'Registro exitoso. Revisa tu correo para activar tu cuenta antes de iniciar sesión.',
      email: user.email,
    };
  }

  async login(dto: LoginDto) {
    const identifier = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { username: { equals: identifier, mode: 'insensitive' } },
        ],
      },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales incorrectas');

    if (!user.email_verified) {
      throw new ForbiddenException({
        message: 'Debes verificar tu correo antes de iniciar sesión',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    return this.generateToken(user);
  }

  async adminLogin(dto: LoginDto) {
    const identifier = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { username: { equals: identifier, mode: 'insensitive' } },
        ],
      },
      include: { role: true },
    });

    if (!user || user.role?.role_name !== 'ADMIN') {
      throw new UnauthorizedException('No autorizado');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales incorrectas');

    return this.generateToken(user);
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { token_hash: this.hashToken(token) },
      include: { user: true },
    });

    if (!record || record.expires_at < new Date()) {
      throw new BadRequestException(
        'El enlace de verificación no es válido o ya expiró.',
      );
    }

    if (record.user.email_verified) {
      await this.prisma.emailVerificationToken.deleteMany({
        where: { user_id: record.user_id },
      });
      return { message: 'Tu correo ya estaba verificado. Puedes iniciar sesión.' };
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { user_id: record.user_id },
        data: { email_verified: true, email_verified_at: new Date() },
      }),
      this.prisma.emailVerificationToken.deleteMany({
        where: { user_id: record.user_id },
      }),
    ]);

    return { message: 'Correo verificado correctamente. Ya puedes iniciar sesión.' };
  }

  /**
   * Always answers with the same message so the endpoint cannot be used to
   * discover which emails are registered.
   */
  async resendVerificationEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user && !user.email_verified) {
      await this.issueVerificationToken(user);
    }

    return { message: GENERIC_RESEND_MESSAGE };
  }

  generateToken(user: User) {
    const payload = { sub: user.user_id, email: user.email, role: user.role.role_name };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        last_name: user.last_name,
        username: user.username,
        role: user.role.role_name,
      },
    };
  }
  logout() {
    // En JWT, el logout se maneja del lado del cliente eliminando el token
    return { message: 'Logout exitoso' };
  }
}
