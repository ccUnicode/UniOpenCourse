import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchCourses(query: string, limit = 10) {
    const q = query?.trim();
    if (!q) throw new BadRequestException('Parámetro "q" es requerido');

    const safeLimit = Math.min(Math.max(limit, 1), 50);

    return this.prisma.course.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { course_code: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        course_id: true,
        name: true,
        course_code: true,
      },
      take: safeLimit,
      orderBy: [{ name: 'asc' }],
    });
  }
}
