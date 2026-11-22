import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    _info: any,
    _context: any,
    _status?: any,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('No se pudo autenticar con Google');
    }
    return user;
  }
}

