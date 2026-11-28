import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Authentication guard for Google OAuth 2.0 routes.
 * Intercepts authorization failures and throws a controlled UnauthorizedException.
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
