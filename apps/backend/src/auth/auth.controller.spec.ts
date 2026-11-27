import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import type { Server } from 'node:http';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController HTTP validation', () => {
  let app: INestApplication<Server>;
  const authService = {
    login: jest.fn(),
    adminLogin: jest.fn(),
    register: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationEmail: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 600_000, limit: 5 }])],
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();
    app = module.createNestApplication<INestApplication<Server>>();
    await app.init();
  });

  beforeEach(() => jest.clearAllMocks());

  afterAll(async () => {
    await app?.close();
  });

  it.each([
    ['login', 'login'],
    ['admin/login', 'adminLogin'],
    ['register', 'register'],
    ['verify-email', 'verifyEmail'],
    ['resend-verification', 'resendVerificationEmail'],
  ] as const)(
    'rejects an empty body on %s before calling the service',
    async (route, method) => {
      await request(app.getHttpServer()).post(`/auth/${route}`).send({}).expect(400);
      expect(authService[method]).not.toHaveBeenCalled();
    },
  );

  it('still accepts a username as the login identifier', async () => {
    const body = { email: 'estudiante1', password: 'example-password' };
    authService.login.mockResolvedValueOnce({ access_token: 'test-token' });

    await request(app.getHttpServer()).post('/auth/login').send(body).expect(201);
    expect(authService.login).toHaveBeenCalledWith(body);
  });
});
