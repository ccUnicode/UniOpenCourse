import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    validateGoogleUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 600_000, limit: 5 }])],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://localhost:3000') },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('googleAuth debe estar definido', () => {
    expect(controller.googleAuth).toBeDefined();
  });

  describe('googleAuthCallback', () => {
    it('debe validar el usuario de Google, setear la cookie y redirigir al frontend', async () => {
      const mockGoogleUser = {
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        accessToken: 'token-123',
      };
      const mockAuthResult = {
        access_token: 'jwt-access-token-abc',
        user: {
          user_id: 1,
          email: 'test@gmail.com',
          username: 'test',
          name: 'Test',
          last_name: 'User',
          role: 'USER',
        },
      };

      mockAuthService.validateGoogleUser.mockResolvedValue(mockAuthResult);

      const req = { user: mockGoogleUser } as any;
      const res = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      } as any;

      await controller.googleAuthCallback(req, res);

      expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith(mockGoogleUser);
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-access-token-abc',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/auth/google/callback?token=jwt-access-token-abc',
      );
    });
  });
});
