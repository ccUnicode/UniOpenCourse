import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  accessToken: string;
}

/**
 * Estrategia de autenticación federada con Google OAuth 2.0.
 * Extrae y valida el perfil básico del usuario (email, nombre y foto).
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  /**
   * Procesa el perfil devuelto por Google y construye el payload normalizado del usuario.
   *
   * @param accessToken Token de acceso emitido por Google
   * @param _refreshToken Token de refresco opcional
   * @param profile Perfil de usuario devuelto por la API de Google
   * @param done Callback de verificación de Passport
   */
  validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { name, emails, photos } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      done(
        new Error('No se encontró un correo electrónico en el perfil de Google'),
        false,
      );
      return;
    }

    const user: GoogleUserPayload = {
      email,
      firstName: name?.givenName ?? '',
      lastName: name?.familyName ?? '',
      picture: photos?.[0]?.value,
      accessToken,
    };

    done(null, user);
  }
}
