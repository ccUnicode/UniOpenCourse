import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: {
    user: {
      create: jest.Mock;
      update: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
    emailVerificationToken: {
      create: jest.Mock;
      deleteMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      upsert: jest.Mock;
    };
    $transaction: jest.Mock;
    $executeRaw: jest.Mock;
  };
  let jwtMock: {
    sign: jest.Mock;
  };
  let mailMock: {
    sendVerificationEmail: jest.Mock;
  };
  let configMock: {
    get: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      user: {
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(null),
        delete: jest.fn(),
      },
      emailVerificationToken: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
        upsert: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (arg: unknown) => {
        if (typeof arg === 'function') {
          return (arg as (tx: typeof prismaMock) => Promise<unknown>)(prismaMock);
        }
        return Promise.all(arg as Promise<unknown>[]);
      }),
      $executeRaw: jest.fn().mockResolvedValue(undefined),
    };

    jwtMock = {
      sign: jest.fn().mockReturnValue('mock_token'),
    };

    mailMock = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    };

    configMock = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          EMAIL_VERIFICATION_EXPIRES_HOURS: '48',
          EMAIL_RESEND_COOLDOWN_MINUTES: '3',
        };
        return values[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: MailService, useValue: mailMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const mockCreatedUser = {
      user_id: 123,
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test',
      last_name: 'User',
      email_verified: false,
      role: { role_name: 'USER' },
    };

    const registerDto = {
      email: '  Test@Example.COM  ',
      username: '  TestUser  ',
      name: ' Test ',
      last_name: ' User ',
      password: 'password123',
    };

    it('should normalize email and username to lower case upon creation', async () => {
      prismaMock.user.create.mockResolvedValue(mockCreatedUser);

      await service.register(registerDto);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          name: 'Test',
          last_name: 'User',
          password: expect.any(String) as unknown as string,
          role: {
            connect: {
              role_name: 'USER',
            },
          },
        },
        include: { role: true },
      });
    });

    it('should not return an access token so the user cannot log in yet', async () => {
      prismaMock.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.register(registerDto);

      expect(result).not.toHaveProperty('access_token');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(jwtMock.sign).not.toHaveBeenCalled();
    });

    it('should create the user and token atomically, then send a verification email', async () => {
      prismaMock.user.create.mockResolvedValue(mockCreatedUser);

      await service.register(registerDto);

      expect(prismaMock.$transaction).toHaveBeenCalled();

      const [[createArgs]] = prismaMock.user.create.mock.calls as Array<
        [{ data: { email_verified?: boolean } }]
      >;
      expect(createArgs.data.email_verified).toBeUndefined();

      expect(prismaMock.emailVerificationToken.upsert).toHaveBeenCalledWith({
        where: { user_id: 123 },
        create: {
          user_id: 123,
          token_hash: expect.any(String) as unknown as string,
          expires_at: expect.any(Date) as unknown as Date,
        },
        update: {
          token_hash: expect.any(String) as unknown as string,
          expires_at: expect.any(Date) as unknown as Date,
          created_at: expect.any(Date) as unknown as Date,
        },
      });
      expect(mailMock.sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Test',
        expect.any(String),
      );
    });

    it('should still register the user when the email provider fails', async () => {
      prismaMock.user.create.mockResolvedValue(mockCreatedUser);
      mailMock.sendVerificationEmail.mockRejectedValue(new Error('Brevo down'));

      await expect(service.register(registerDto)).resolves.toHaveProperty('email');
    });

    it('should allow re-registration when an unverified account has expired tokens', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({
          user_id: 99,
          email: 'test@example.com',
          username: 'testuser',
          email_verified: false,
        })
        .mockResolvedValueOnce(null);
      prismaMock.emailVerificationToken.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockCreatedUser);

      await service.register(registerDto);

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { user_id: 99 },
      });
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('should reject registration when an unverified account still has a valid token', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        user_id: 99,
        email: 'test@example.com',
        username: 'testuser',
        email_verified: false,
      });
      prismaMock.emailVerificationToken.findFirst.mockResolvedValue({
        id: 1,
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should match user case-insensitively and return token when password matches', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        user_id: 123,
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        name: 'Test',
        last_name: 'User',
        email_verified: true,
        role: { role_name: 'USER' },
      };
      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'TestUser',
        password: 'password123',
      });

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { equals: 'testuser', mode: 'insensitive' } },
            { username: { equals: 'testuser', mode: 'insensitive' } },
          ],
        },
        include: { role: true },
      });
      expect(result).toHaveProperty('access_token', 'mock_token');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        user_id: 123,
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        email_verified: true,
        role: { role_name: 'USER' },
      };
      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'testuser', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException if the email is not verified', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        user_id: 123,
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        email_verified: false,
        role: { role_name: 'USER' },
      };
      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'testuser', password: 'password123' }),
      ).rejects.toThrow(ForbiddenException);
      expect(jwtMock.sign).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should mark the user as verified with a valid token', async () => {
      prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
        id: 1,
        user_id: 123,
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
        user: { user_id: 123, email_verified: false },
      });

      const result = await service.verifyEmail('a-valid-token');

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { user_id: 123 },
        data: {
          email_verified: true,
          email_verified_at: expect.any(Date) as unknown as Date,
        },
      });
      expect(result.message).toContain('verificado');
    });

    it('should throw BadRequestException if the token has expired', async () => {
      prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
        id: 1,
        user_id: 123,
        expires_at: new Date(Date.now() - 60 * 60 * 1000),
        user: { user_id: 123, email_verified: false },
      });

      await expect(service.verifyEmail('an-expired-token')).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if the token does not exist', async () => {
      prismaMock.emailVerificationToken.findUnique.mockResolvedValue(null);

      await expect(service.verifyEmail('unknown-token')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resendVerificationEmail', () => {
    it('should send a new email when the account is pending verification', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        user_id: 123,
        email: 'test@example.com',
        name: 'Test',
        email_verified: false,
      });

      await service.resendVerificationEmail('Test@Example.com');

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(mailMock.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should return the same generic message for unknown or verified emails', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const unknown = await service.resendVerificationEmail('nobody@example.com');

      prismaMock.user.findUnique.mockResolvedValue({
        user_id: 123,
        email: 'test@example.com',
        name: 'Test',
        email_verified: true,
      });
      const verified = await service.resendVerificationEmail('test@example.com');

      expect(unknown.message).toEqual(verified.message);
      expect(mailMock.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should not send another email while the resend cooldown is active', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        user_id: 123,
        email: 'test@example.com',
        name: 'Test',
        email_verified: false,
      });
      prismaMock.emailVerificationToken.findFirst.mockResolvedValue({
        id: 1,
        created_at: new Date(),
      });

      const result = await service.resendVerificationEmail('test@example.com');

      expect(result.message).toContain('Si el correo existe');
      expect(mailMock.sendVerificationEmail).not.toHaveBeenCalled();
      expect(prismaMock.emailVerificationToken.upsert).not.toHaveBeenCalled();
    });

    it('should only send one email when two resends run concurrently', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        user_id: 123,
        email: 'test@example.com',
        name: 'Test',
        email_verified: false,
      });

      let lockHeld = false;
      const waiters: Array<() => void> = [];
      let latestCreatedAt: Date | null = null;

      const acquireLock = async () => {
        while (lockHeld) {
          await new Promise<void>((resolve) => {
            waiters.push(resolve);
          });
        }
        lockHeld = true;
      };

      const releaseLock = () => {
        lockHeld = false;
        const next = waiters.shift();
        if (next) {
          next();
        }
      };

      prismaMock.$executeRaw.mockImplementation(async () => {
        await acquireLock();
        await new Promise((resolve) => setTimeout(resolve, 25));
        releaseLock();
      });

      prismaMock.emailVerificationToken.findFirst.mockImplementation(() => {
        if (!latestCreatedAt) {
          return Promise.resolve(null);
        }
        return Promise.resolve({ id: 1, created_at: latestCreatedAt });
      });

      prismaMock.emailVerificationToken.upsert.mockImplementation(() => {
        latestCreatedAt = new Date();
        return Promise.resolve({ id: 1 });
      });

      await Promise.all([
        service.resendVerificationEmail('test@example.com'),
        service.resendVerificationEmail('test@example.com'),
      ]);

      expect(prismaMock.emailVerificationToken.upsert).toHaveBeenCalledTimes(1);
      expect(mailMock.sendVerificationEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('adminLogin', () => {
    it('should authenticate admin users without requiring email verification', async () => {
      const hashedPassword = await bcrypt.hash('adminpass', 10);
      const mockAdminUser = {
        user_id: 999,
        email: 'admin@example.com',
        username: 'adminuser',
        password: hashedPassword,
        name: 'Admin',
        last_name: 'User',
        email_verified: false,
        role: { role_name: 'ADMIN' },
      };
      prismaMock.user.findFirst.mockResolvedValue(mockAdminUser);

      const result = await service.adminLogin({
        email: 'ADMIN@EXAMPLE.COM',
        password: 'adminpass',
      });

      expect(result).toHaveProperty('access_token', 'mock_token');
    });

    it('should throw UnauthorizedException if user is not an ADMIN', async () => {
      const hashedPassword = await bcrypt.hash('adminpass', 10);
      const mockNormalUser = {
        user_id: 999,
        email: 'normal@example.com',
        password: hashedPassword,
        role: { role_name: 'USER' },
      };
      prismaMock.user.findFirst.mockResolvedValue(mockNormalUser);

      await expect(
        service.adminLogin({ email: 'normal@example.com', password: 'adminpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateGoogleUser', () => {
    const mockGooglePayload = {
      email: 'jeferson@gmail.com',
      firstName: 'Jeferson',
      lastName: 'Snyder',
      picture: 'https://lh3.googleusercontent.com/pic.jpg',
      accessToken: 'token-xyz',
    };

    it('debe registrar un usuario nuevo y emitir JWT si no existe en BD', async () => {
      // 1. findUnique por email no encuentra al usuario
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      // 2. findUnique por username no encuentra colisión
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      const mockCreatedUser = {
        user_id: 10,
        email: 'jeferson@gmail.com',
        username: 'jeferson',
        name: 'Jeferson',
        last_name: 'Snyder',
        email_verified: true,
        role: { role_name: 'USER' },
      };
      prismaMock.user.create.mockResolvedValueOnce(mockCreatedUser);
      jwtMock.sign.mockReturnValue('signed_google_jwt');

      const result = await service.validateGoogleUser(mockGooglePayload);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'jeferson@gmail.com' },
        include: { role: true },
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'jeferson@gmail.com',
            email_verified: true,
            role: { connect: { role_name: 'USER' } },
          }) as unknown as Record<string, unknown>,
        }),
      );
      expect(result).toEqual({
        access_token: 'signed_google_jwt',
        user: {
          user_id: 10,
          email: 'jeferson@gmail.com',
          username: 'jeferson',
          name: 'Jeferson',
          last_name: 'Snyder',
          role: 'USER',
        },
      });
    });

    it('debe actualizar email_verified a true si el usuario ya existía sin verificar', async () => {
      const mockUnverifiedUser = {
        user_id: 10,
        email: 'jeferson@gmail.com',
        username: 'jeferson',
        name: 'Jeferson',
        last_name: 'Snyder',
        email_verified: false,
        role: { role_name: 'USER' },
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(mockUnverifiedUser);
      prismaMock.user.update.mockResolvedValueOnce({
        ...mockUnverifiedUser,
        email_verified: true,
        email_verified_at: new Date(),
      });
      jwtMock.sign.mockReturnValue('signed_google_jwt');

      const result = await service.validateGoogleUser(mockGooglePayload);

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 10 },
          data: expect.objectContaining({
            email_verified: true,
          }) as unknown as Record<string, unknown>,
        }),
      );
      expect(result.access_token).toBe('signed_google_jwt');
    });

    it('debe reutilizar el usuario si ya existe y está verificado', async () => {
      const mockVerifiedUser = {
        user_id: 10,
        email: 'jeferson@gmail.com',
        username: 'jeferson',
        name: 'Jeferson',
        last_name: 'Snyder',
        email_verified: true,
        role: { role_name: 'USER' },
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(mockVerifiedUser);
      jwtMock.sign.mockReturnValue('signed_google_jwt');

      const result = await service.validateGoogleUser(mockGooglePayload);

      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(result.user.email).toBe('jeferson@gmail.com');
    });

    it('debe resolver colisiones de username agregando un sufijo único', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null); // por email
      prismaMock.user.findUnique.mockResolvedValueOnce({
        user_id: 1,
        username: 'jeferson',
      }); // primer username choca
      prismaMock.user.findUnique.mockResolvedValueOnce(null); // segundo candidato pasa

      const mockCreatedWithSuffix = {
        user_id: 11,
        email: 'jeferson@gmail.com',
        username: 'jeferson_a1b2',
        name: 'Jeferson',
        last_name: 'Snyder',
        email_verified: true,
        role: { role_name: 'USER' },
      };
      prismaMock.user.create.mockResolvedValueOnce(mockCreatedWithSuffix);
      jwtMock.sign.mockReturnValue('signed_google_jwt');

      const result = await service.validateGoogleUser(mockGooglePayload);

      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(result.user.username).toBe('jeferson_a1b2');
    });
  });
});
