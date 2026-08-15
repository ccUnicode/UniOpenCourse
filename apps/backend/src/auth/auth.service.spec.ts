import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
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
    };
    emailVerificationToken: {
      create: jest.Mock;
      deleteMany: jest.Mock;
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
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
        findUnique: jest.fn(),
      },
      emailVerificationToken: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findUnique: jest.fn(),
      },
      $transaction: jest.fn().mockResolvedValue([]),
    };

    jwtMock = {
      sign: jest.fn().mockReturnValue('mock_token'),
    };

    mailMock = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    };

    configMock = {
      get: jest.fn().mockReturnValue('48'),
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

    it('should create the user unverified and send a verification email', async () => {
      prismaMock.user.create.mockResolvedValue(mockCreatedUser);

      await service.register(registerDto);

      const [[createArgs]] = prismaMock.user.create.mock.calls as Array<
        [{ data: { email_verified?: boolean } }]
      >;
      expect(createArgs.data.email_verified).toBeUndefined();

      expect(prismaMock.emailVerificationToken.create).toHaveBeenCalledWith({
        data: {
          user_id: 123,
          token_hash: expect.any(String) as unknown as string,
          expires_at: expect.any(Date) as unknown as Date,
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
});
