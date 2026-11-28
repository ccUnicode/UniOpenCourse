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
 * Federated authentication strategy for Google OAuth 2.0.
 * Extracts and validates the user's basic profile (email, name, and photo).
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
   * Processes the profile returned by Google and builds the normalized user payload.
   *
   * @param accessToken Access token issued by Google
   * @param _refreshToken Optional refresh token
   * @param profile User profile returned by the Google API
   * @param done Passport verification callback
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
