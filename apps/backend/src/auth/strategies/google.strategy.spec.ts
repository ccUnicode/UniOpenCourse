import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';
import { Profile } from 'passport-google-oauth20';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      switch (key) {
        case 'GOOGLE_CLIENT_ID':
          return 'mock-google-client-id';
        case 'GOOGLE_CLIENT_SECRET':
          return 'mock-google-client-secret';
        case 'GOOGLE_CALLBACK_URL':
          return 'http://localhost:3001/auth/google/callback';
        default:
          throw new Error(`Unexpected key: ${key}`);
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  it('debe estar definida e inicializarse con las credenciales de config', () => {
    expect(strategy).toBeDefined();
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('GOOGLE_CLIENT_ID');
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('GOOGLE_CLIENT_SECRET');
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('GOOGLE_CALLBACK_URL');
  });

  it('debe extraer y validar el perfil de Google correctamente', () => {
    const mockProfile: Profile = {
      id: '123456789',
      displayName: 'Jeferson Snyder',
      name: {
        givenName: 'Jeferson',
        familyName: 'Snyder',
      },
      emails: [{ value: 'jeferson@gmail.com', verified: true }],
      photos: [{ value: 'https://lh3.googleusercontent.com/photo.jpg' }],
      provider: 'google',
      profileUrl: 'https://profiles.google.com/123456789',
      _raw: '',
      _json: {} as unknown as Profile['_json'],
    };

    const done = jest.fn();

    strategy.validate('access-token-123', 'refresh-token-123', mockProfile, done);

    expect(done).toHaveBeenCalledWith(null, {
      email: 'jeferson@gmail.com',
      firstName: 'Jeferson',
      lastName: 'Snyder',
      picture: 'https://lh3.googleusercontent.com/photo.jpg',
      accessToken: 'access-token-123',
    });
  });

  it('debe llamar a done con error si el perfil de Google no contiene emails', () => {
    const mockProfileWithoutEmail: Profile = {
      id: '123456789',
      displayName: 'Usuario Sin Correo',
      provider: 'google',
      profileUrl: 'https://profiles.google.com/123456789',
      _raw: '',
      _json: {} as unknown as Profile['_json'],
    };

    const done = jest.fn();

    strategy.validate(
      'access-token-123',
      'refresh-token-123',
      mockProfileWithoutEmail,
      done,
    );

    expect(done).toHaveBeenCalledWith(expect.any(Error), false);
  });
});
