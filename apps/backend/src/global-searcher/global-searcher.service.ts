import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SearchDto } from './dto/global-search.dto';

@Injectable()
export class GlobalSearcherService {
  constructor(private prisma: PrismaService) {}
  async search(query: SearchDto) {
    const pageSize = 6;
    const { q, page = 1 } = query;
    if (!q || q.length < 2) {
      return { data: { courses: [], classes: [] }, page, totalPages: 0, totalResults: 0 };
    }
    const offset = (page - 1) * pageSize;

    // Contar el total de resultados para cursos y clases
    const TotalCourses = await this.prisma.course.count({
      where: {
        name: {
          contains: q,
          mode: 'insensitive', // Búsqueda insensible a mayúsculas
        },
      },
    });
    const TotalClasses = await this.prisma.class.count({
      where: {
        title: {
          contains: q,
          mode: 'insensitive', // Búsqueda insensible a mayúsculas
        },
      },
    });

    const totalResults = TotalCourses + TotalClasses;
    const totalPages = Math.ceil(totalResults / pageSize);

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
      data: {
        courses,
        classes,
      },
      page,
      totalPages,
      totalResults,
    };
  }
  getSuggestions(query: string) {}
}
