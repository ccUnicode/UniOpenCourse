import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma';
import { PrismaService } from '../prisma.service';
import { FindAllUsersDto } from './dto/find-all-users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists registered users with a strict allowlist of profile fields.
   * @param query - Validated pagination and optional name, username or email search.
   * @returns Matching profiles and pagination metadata, without credentials or tokens.
   */
  async findAll({ page = 1, limit = 10, search }: FindAllUsersDto) {
    const term = search?.trim();
    const where: Prisma.UserWhereInput = term
      ? {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { last_name: { contains: term, mode: 'insensitive' } },
            { username: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
