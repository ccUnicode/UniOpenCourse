import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

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
    expect(typeof controller.googleAuth).toBe('function');
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

      const req = { user: mockGoogleUser } as unknown as Request;
      const mockCookie = jest.fn();
      const mockRedirect = jest.fn();
      const res = {
        cookie: mockCookie,
        redirect: mockRedirect,
      } as unknown as Response;

      await controller.googleAuthCallback(req, res);

      expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith(mockGoogleUser);
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-access-token-abc',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }) as unknown as Record<string, unknown>,
      );
      expect(mockRedirect).toHaveBeenCalledWith(
        'http://localhost:3000/auth/google/callback?token=jwt-access-token-abc',
      );
    });
  });
});
