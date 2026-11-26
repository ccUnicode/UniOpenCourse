import 'reflect-metadata';
import { PrismaService } from '../prisma.service';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const prisma = {
    user: { findMany: jest.fn(), count: jest.fn() },
    $transaction: jest.fn(),
  };
  const service = new UsersService(prisma as unknown as PrismaService);

  beforeEach(() => jest.resetAllMocks());

  it('uses a strict profile projection and stable order with default pagination', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);
    await expect(service.findAll(new FindAllUsersDto())).resolves.toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      orderBy: [{ register_date: 'desc' }, { user_id: 'desc' }],
      select: {
        user_id: true,
        name: true,
        last_name: true,
        username: true,
        email: true,
        email_verified: true,
        register_date: true,
        role: { select: { role_id: true, role_name: true } },
      },
    });
    expect(prisma.user.count).toHaveBeenCalledWith({ where: {} });
  });

  it('applies the same case-insensitive filter to rows and count', async () => {
    const profiles = [{ user_id: 3, name: 'Gabriel', role: { role_name: 'USER' } }];
    prisma.$transaction.mockResolvedValue([profiles, 31]);
    const result = await service.findAll({ page: 2, limit: 15, search: ' Gabriel ' });
    const where = {
      OR: ['name', 'last_name', 'username', 'email'].map((field) => ({
        [field]: { contains: 'Gabriel', mode: 'insensitive' },
      })),
    };
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where,
        skip: 15,
        take: 15,
      }),
    );
    expect(prisma.user.count).toHaveBeenCalledWith({ where });
    expect(result).toEqual({
      data: profiles,
      total: 31,
      page: 2,
      limit: 15,
      totalPages: 3,
    });
  });

  it('treats whitespace search as no filter', async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);
    await service.findAll({ page: 1, limit: 10, search: '   ' });
    expect(prisma.user.count).toHaveBeenCalledWith({ where: {} });
  });

  it('returns an empty page beyond the last page while preserving the total', async () => {
    prisma.$transaction.mockResolvedValue([[], 2]);
    await expect(service.findAll({ page: 3, limit: 10 })).resolves.toEqual({
      data: [],
      total: 2,
      page: 3,
      limit: 10,
      totalPages: 1,
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20 }),
    );
  });
});
