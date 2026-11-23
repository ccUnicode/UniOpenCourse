import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guardián de autenticación para rutas de Google OAuth 2.0.
 * Intercepta y traduce errores de autorización a excepciones controladas en español.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  override handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw (
        (err as Error) || new UnauthorizedException('No se pudo autenticar con Google')
      );
    }
    return user;
  }
}
