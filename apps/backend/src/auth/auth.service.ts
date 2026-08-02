import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { User } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        username: dto.username,
        last_name: dto.last_name,
        role: {
          connect: { role_name: 'USER' },
        },
        password: hashedPassword,
      },
      include: { role: true }, // Incluir el rol para generar el token correctamente
    });
    return this.generateToken(user);
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales incorrectas');

    return this.generateToken(user);
  }
  async adminLogin(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true }, // Incluir el rol para verificarlo
    });

    if (!user || user.role?.role_name !== 'ADMIN') {
      throw new UnauthorizedException('No autorizado');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales incorrectas');

    return this.generateToken(user);
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
