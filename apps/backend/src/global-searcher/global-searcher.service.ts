import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SearchDto } from './dto/global-search.dto';

@Injectable()
export class GlobalSearcherService {
  constructor(private prisma: PrismaService) {}
  async search(query: SearchDto) {
    const pageSize = 6;
    const { q, page = 1 } = query;
    const offset = (page - 1) * pageSize;
    console.log('QUERY:', query.q);
    const courses = await this.prisma.course.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive', // Búsqueda insensible a mayúsculas
        },
      },
      skip: offset,
      take: pageSize,
      include: {
        teacher: true,
      },
    });
    const classes = await this.prisma.class.findMany({
      where: {
        title: {
          contains: q,
          mode: 'insensitive', // Búsqueda insensible a mayúsculas
        },
      },
      skip: offset,
      take: pageSize,
      include: {
        course: true,
      },
    });
    return {
      courses,
      classes,
    };
  }
  getSuggestions(query: string) {}
}
