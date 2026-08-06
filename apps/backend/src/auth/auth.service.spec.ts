import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: any;
  let jwtMock: any;

  beforeEach(async () => {
    prismaMock = {
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    jwtMock = {
      sign: jest.fn().mockReturnValue('mock_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should normalize email and username to lower case upon creation', async () => {
      const mockCreatedUser = {
        user_id: '123',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test',
        last_name: 'User',
        role: { role_name: 'USER' },
      };
      prismaMock.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.register({
        email: '  Test@Example.COM  ',
        username: '  TestUser  ',
        name: ' Test ',
        last_name: ' User ',
        password: 'password123',
      });

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
          username: 'testuser',
        }),
        include: { role: true },
      });
      expect(result).toHaveProperty('access_token', 'mock_token');
    });
  });

  describe('login', () => {
    it('should match user case-insensitively and return token when password matches', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        user_id: '123',
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        name: 'Test',
        last_name: 'User',
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
        user_id: '123',
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        role: { role_name: 'USER' },
      };
      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'testuser', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('adminLogin', () => {
    it('should authenticate admin users case-insensitively', async () => {
      const hashedPassword = await bcrypt.hash('adminpass', 10);
      const mockAdminUser = {
        user_id: '999',
        email: 'admin@example.com',
        username: 'adminuser',
        password: hashedPassword,
        name: 'Admin',
        last_name: 'User',
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
        user_id: '999',
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

