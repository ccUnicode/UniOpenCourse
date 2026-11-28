import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { Prisma } from '../generated/prisma';
import { GoogleUserPayload } from './strategies/google.strategy';

const GENERIC_RESEND_MESSAGE =
  'Si el correo existe y aún no está verificado, recibirás un enlace de verificación.';
const MAX_GOOGLE_USER_CREATE_ATTEMPTS = 5;

type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private config: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();
    const username = registerDto.username.trim().toLowerCase();
    const name = registerDto.name.trim();
    const last_name = registerDto.last_name.trim();

    await this.resolveRegistrationConflicts(email, username);

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + this.getVerificationExpiresMs());

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          username,
          name,
          last_name,
          password: hashedPassword,
          role: {
            connect: {
              role_name: 'USER',
            },
          },
        },
        include: { role: true },
      });

      await tx.$executeRaw`
        SELECT user_id FROM "User" WHERE user_id = ${created.user_id} FOR UPDATE
      `;

      await tx.emailVerificationToken.upsert({
        where: { user_id: created.user_id },
        create: {
          user_id: created.user_id,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
        update: {
          token_hash: tokenHash,
          expires_at: expiresAt,
          created_at: new Date(),
        },
      });

      return created;
    });

    try {
      await this.mailService.sendVerificationEmail(user.email, user.name, rawToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    return {
      message:
        'Registro exitoso. Revisa tu correo para verificar tu cuenta antes de iniciar sesión.',
      email: user.email,
    };
  }

  async login(loginDto: LoginDto) {
    const identifier = loginDto.email.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { username: { equals: identifier, mode: 'insensitive' } },
        ],
      },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.email_verified) {
      throw new ForbiddenException({
        message: 'Debes verificar tu correo electrónico antes de iniciar sesión.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.role.role_name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        name: user.name,
        last_name: user.last_name,
        role: user.role.role_name,
      },
    };
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);

    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { token_hash: tokenHash },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new BadRequestException('Token de verificación inválido o expirado');
    }

    if (verificationToken.expires_at < new Date()) {
      throw new BadRequestException('Token de verificación inválido o expirado');
    }

    if (verificationToken.user.email_verified) {
      return { message: 'Tu correo ya estaba verificado. Puedes iniciar sesión.' };
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { user_id: verificationToken.user_id },
        data: {
          email_verified: true,
          email_verified_at: new Date(),
        },
      }),
      this.prisma.emailVerificationToken.deleteMany({
        where: { user_id: verificationToken.user_id },
      }),
    ]);

    return {
      message: 'Correo verificado correctamente. Ya puedes iniciar sesión.',
    };
  }

  async resendVerificationEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.email_verified) {
      return { message: GENERIC_RESEND_MESSAGE };
    }

    try {
      const rawToken = await this.rotateVerificationToken(user);
      if (rawToken) {
        await this.mailService.sendVerificationEmail(user.email, user.name, rawToken);
      }
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    }

    return { message: GENERIC_RESEND_MESSAGE };
  }

  async adminLogin(loginDto: LoginDto) {
    const identifier = loginDto.email.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { username: { equals: identifier, mode: 'insensitive' } },
        ],
      },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.role.role_name !== 'ADMIN') {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.role.role_name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        name: user.name,
        last_name: user.last_name,
        role: user.role.role_name,
      },
    };
  }

  logout() {
    return { message: 'Logout exitoso' };
  }

  private async resolveRegistrationConflicts(
    email: string,
    username: string,
  ): Promise<void> {
    const byEmail = await this.prisma.user.findUnique({ where: { email } });

    if (byEmail) {
      if (byEmail.email_verified) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }

      if (await this.hasActiveVerificationToken(byEmail.user_id)) {
        throw new ConflictException(
          'El correo electrónico ya está registrado. Revisa tu bandeja o solicita un nuevo enlace.',
        );
      }

      await this.deleteUnverifiedUser(byEmail.user_id);
    }

    const byUsername = await this.prisma.user.findUnique({ where: { username } });

    if (byUsername) {
      if (byUsername.email_verified) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }

      if (byUsername.email !== email) {
        if (await this.hasActiveVerificationToken(byUsername.user_id)) {
          throw new ConflictException('El nombre de usuario ya está en uso');
        }

        await this.deleteUnverifiedUser(byUsername.user_id);
      }
    }
  }

  private async deleteUnverifiedUser(userId: number): Promise<void> {
    await this.prisma.user.delete({ where: { user_id: userId } });
  }

  private async hasActiveVerificationToken(userId: number): Promise<boolean> {
    const activeToken = await this.prisma.emailVerificationToken.findFirst({
      where: {
        user_id: userId,
        expires_at: { gt: new Date() },
      },
    });

    return activeToken !== null;
  }

  private async rotateVerificationToken(user: {
    user_id: number;
    email: string;
    name: string;
  }): Promise<string | null> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.$executeRaw`
        SELECT user_id FROM "User" WHERE user_id = ${user.user_id} FOR UPDATE
      `;

      const latestToken = await tx.emailVerificationToken.findFirst({
        where: { user_id: user.user_id },
        orderBy: { created_at: 'desc' },
      });

      if (
        latestToken &&
        Date.now() - latestToken.created_at.getTime() < this.getResendCooldownMs()
      ) {
        return null;
      }

      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = this.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + this.getVerificationExpiresMs());

      await tx.emailVerificationToken.upsert({
        where: { user_id: user.user_id },
        create: {
          user_id: user.user_id,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
        update: {
          token_hash: tokenHash,
          expires_at: expiresAt,
          created_at: new Date(),
        },
      });

      return rawToken;
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getVerificationExpiresMs(): number {
    const hours = Number(
      this.config.get<string>('EMAIL_VERIFICATION_EXPIRES_HOURS') ?? 48,
    );
    return hours * 60 * 60 * 1000;
  }

  private getResendCooldownMs(): number {
    const minutes = Number(this.config.get<string>('EMAIL_RESEND_COOLDOWN_MINUTES') ?? 3);
    return minutes * 60 * 1000;
  }

  /**
   * Validates a user authenticated through Google OAuth.
   * Creates the account with role USER and verified status if it does not exist,
   * or completes email verification if an unverified account already exists.
   *
   * @param googleUser Normalized profile returned by the Google strategy
   * @returns Signed access_token and public user details
   */
  async validateGoogleUser(googleUser: GoogleUserPayload) {
    const email = googleUser.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    const user = existingUser
      ? await this.ensureGoogleUserVerified(existingUser)
      : await this.createGoogleUser(email, googleUser);

    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.role.role_name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        name: user.name,
        last_name: user.last_name,
        role: user.role.role_name,
      },
    };
  }

  /**
   * Ensures an existing account matched by Google OAuth is marked verified and
   * has any legacy password/token invalidated atomically if still unverified.
   */
  private async ensureGoogleUserVerified(user: UserWithRole): Promise<UserWithRole> {
    if (user.email_verified) {
      return user;
    }

    const userId = user.user_id;
    const randomPassword = randomBytes(32).toString('hex');
    const invalidatedPassword = await bcrypt.hash(randomPassword, 10);

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: {
          user_id: userId,
          email_verified: false,
        },
        data: {
          password: invalidatedPassword,
          email_verified: true,
          email_verified_at: new Date(),
        },
      });

      if (updated.count > 0) {
        await tx.emailVerificationToken.deleteMany({
          where: { user_id: userId },
        });
      }
    });

    const refreshedUser = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: { role: true },
    });
    if (!refreshedUser) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return refreshedUser;
  }

  /**
   * Creates a new Google user with bounded recovery on P2002 unique-constraint
   * conflicts for either email or username races.
   */
  private async createGoogleUser(
    email: string,
    googleUser: GoogleUserPayload,
  ): Promise<UserWithRole> {
    const baseUsername = this.generateBaseUsername(
      googleUser.email,
      googleUser.firstName,
    );
    let candidateUsername = await this.generateUniqueUsername(baseUsername);

    const randomPassword = randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const name = (googleUser.firstName || 'Usuario').trim().slice(0, 50);
    const lastName = (googleUser.lastName || '').trim().slice(0, 50);

    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_GOOGLE_USER_CREATE_ATTEMPTS; attempt++) {
      try {
        return await this.prisma.user.create({
          data: {
            email,
            username: candidateUsername,
            name,
            last_name: lastName,
            password: hashedPassword,
            email_verified: true,
            email_verified_at: new Date(),
            role: {
              connect: {
                role_name: 'USER',
              },
            },
          },
          include: { role: true },
        });
      } catch (error: unknown) {
        if (
          !(error instanceof Prisma.PrismaClientKnownRequestError) ||
          error.code !== 'P2002'
        ) {
          throw error;
        }

        // Check by email first because driver adapters may populate meta.table rather than target columns.
        const existingByEmail = await this.prisma.user.findUnique({
          where: { email },
          include: { role: true },
        });
        if (existingByEmail) {
          return this.ensureGoogleUserVerified(existingByEmail);
        }

        lastError = error;
        if (attempt < MAX_GOOGLE_USER_CREATE_ATTEMPTS - 1) {
          candidateUsername = await this.generateUniqueUsername(baseUsername, {
            skipBase: true,
          });
        }
      }
    }

    throw lastError;
  }

  private generateBaseUsername(email: string, firstName?: string): string {
    const raw = (firstName || email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '');
    return (raw || 'user').slice(0, 50);
  }

  private buildSuffixedUsername(baseUsername: string, suffix: string): string {
    return `${baseUsername.slice(0, 70 - suffix.length)}${suffix}`;
  }

  private async generateUniqueUsername(
    baseUsername: string,
    options: { skipBase?: boolean } = {},
  ): Promise<string> {
    if (!options.skipBase) {
      const existing = await this.prisma.user.findUnique({
        where: { username: baseUsername },
      });
      if (!existing) {
        return baseUsername;
      }
    }
    for (let i = 0; i < 5; i++) {
      const suffix = `_${randomBytes(2).toString('hex')}`;
      const candidate = this.buildSuffixedUsername(baseUsername, suffix);
      const found = await this.prisma.user.findUnique({
        where: { username: candidate },
      });
      if (!found) return candidate;
    }
    return this.buildSuffixedUsername(baseUsername, `_${Date.now()}`);
  }
}
