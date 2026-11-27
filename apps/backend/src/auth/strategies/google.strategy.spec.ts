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

  it('should be defined and initialized with config credentials', () => {
    expect(strategy).toBeDefined();
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('GOOGLE_CLIENT_ID');
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('GOOGLE_CLIENT_SECRET');
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('GOOGLE_CALLBACK_URL');
  });

  it('should extract and validate Google profile correctly', () => {
    const mockProfile: Profile = {
      id: '123456789',
      displayName: 'Test User',
      name: {
        givenName: 'Test',
        familyName: 'User',
      },
      emails: [{ value: 'user@example.com', verified: true }],
      photos: [{ value: 'https://lh3.googleusercontent.com/photo.jpg' }],
      provider: 'google',
      profileUrl: 'https://profiles.google.com/123456789',
      _raw: '',
      _json: {} as unknown as Profile['_json'],
    };

    const done = jest.fn();

    strategy.validate('access-token-123', 'refresh-token-123', mockProfile, done);

    expect(done).toHaveBeenCalledWith(null, {
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      picture: 'https://lh3.googleusercontent.com/photo.jpg',
      accessToken: 'access-token-123',
    });
  });

  it('should invoke done with error when Google profile has no emails', () => {
    const mockProfileWithoutEmail: Profile = {
      id: '123456789',
      displayName: 'User Without Email',
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
