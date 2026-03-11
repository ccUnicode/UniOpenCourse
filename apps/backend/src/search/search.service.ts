import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchCourses(query: string, limit = 10) {
    const q = query?.trim();
    if (!q) throw new BadRequestException('Parámetro "q" es requerido');

    const safeLimit = Math.min(Math.max(limit, 1), 50);

    return this.prisma.curso.findMany({
      where: {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { codigo_curso: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id_curso: true,
        nombre: true,
        codigo_curso: true,
      },
      take: safeLimit,
      orderBy: [{ nombre: 'asc' }],
    });
  }
}
