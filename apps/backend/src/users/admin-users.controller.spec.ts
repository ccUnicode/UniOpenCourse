import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { App } from 'supertest/types';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PrismaService } from '../prisma.service';
import { UsersModule } from './users.module';

describe('GET /admin/users', () => {
  let app: INestApplication<App>;
  let jwt: JwtService;
  const prisma = {
    user: { findMany: jest.fn(), count: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [UsersModule, JwtModule.register({ secret: 'users-test-secret' })],
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: { getOrThrow: () => 'users-test-secret' } },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication<INestApplication<App>>();
    app.use(cookieParser());
    await app.init();
    jwt = module.get(JwtService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockResolvedValue([[], 0]);
  });

  afterAll(async () => {
    await app?.close();
  });

  const tokenFor = (role: string) =>
    jwt.sign({ sub: 1, email: 'user@example.test', role });

  it('rejects unauthenticated requests before querying users', async () => {
    await request(app.getHttpServer()).get('/admin/users').expect(401);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('rejects invalid tokens', async () => {
    await request(app.getHttpServer())
      .get('/admin/users')
      .auth('invalid-token', { type: 'bearer' })
      .expect(401);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('rejects expired tokens', async () => {
    const expired = jwt.sign({ sub: 1, role: 'ADMIN' }, { expiresIn: -1 });
    await request(app.getHttpServer())
      .get('/admin/users')
      .auth(expired, { type: 'bearer' })
      .expect(401);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('rejects regular users with a valid token', async () => {
    await request(app.getHttpServer())
      .get('/admin/users')
      .auth(tokenFor('USER'), { type: 'bearer' })
      .expect(403);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('allows ADMIN and applies default pagination', async () => {
    await request(app.getHttpServer())
      .get('/admin/users')
      .auth(tokenFor('ADMIN'), { type: 'bearer' })
      .expect(200)
      .expect({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
  });

  it('transforms page and limit and trims search', async () => {
    await request(app.getHttpServer())
      .get('/admin/users')
      .query({ page: '2', limit: '15', search: ' Gabriel ' })
      .auth(tokenFor('ADMIN'), { type: 'bearer' })
      .expect(200);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 15,
        take: 15,
        where: {
          OR: ['name', 'last_name', 'username', 'email'].map((field) => ({
            [field]: { contains: 'Gabriel', mode: 'insensitive' },
          })),
        },
      }),
    );
  });

  it('accepts the maximum allowed page size', async () => {
    await request(app.getHttpServer())
      .get('/admin/users')
      .query({ limit: 100 })
      .auth(tokenFor('ADMIN'), { type: 'bearer' })
      .expect(200);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it('accepts the existing ADMIN session cookie', async () => {
    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Cookie', `access_token=${tokenFor('ADMIN')}`)
      .expect(200);
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
  });

  it.each([
    { page: 0 },
    { page: -1 },
    { page: 1.5 },
    { page: 'abc' },
    { page: 21474837 },
    { limit: 0 },
    { limit: -1 },
    { limit: 1.5 },
    { limit: 101 },
    { limit: 'abc' },
    { search: 'a'.repeat(101) },
    { search: ['one', 'two'] },
    { unknown: 'field' },
  ])('rejects invalid query %j before accessing the database', async (query) => {
    await request(app.getHttpServer())
      .get('/admin/users')
      .query(query)
      .auth(tokenFor('ADMIN'), { type: 'bearer' })
      .expect(400);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });
});
