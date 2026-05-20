import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchDto } from './dto/global-search.dto';

@Injectable()
export class GlobalSearcherService {
  constructor(private prisma: PrismaService) {}
  async search(query: SearchDto) {
    const MAX_PAGE = 1000;
    const pageSize = 6;
    const { q, page = 1 } = query;
    const safePage = Math.min(MAX_PAGE, page);
    const offset = (safePage - 1) * pageSize;

    const [TotalCourses, TotalClasses, courses, classes] = await Promise.all([
      this.prisma.course.count({
        where: {
          name: {
            contains: q,
            mode: 'insensitive', // Búsqueda insensible a mayúsculas
          },
        },
      }),
      this.prisma.class.count({
        where: {
          title: {
            contains: q,
            mode: 'insensitive',
          },
        },
      }),
      this.prisma.course.findMany({
        where: {
          OR: [
            {
              name: {
                contains: q,
                mode: 'insensitive',
              },
            },
            {
              course_code: {
                contains: q,
                mode: 'insensitive',
              },
            },
          ],
        },
        skip: offset,
        take: pageSize,
        include: {
          teacher: true,
        },
      }),
      this.prisma.class.findMany({
        where: {
          title: {
            contains: q,
            mode: 'insensitive',
          },
        },
        skip: offset,
        take: pageSize,
        include: {
          course: true,
        },
      }),
    ]);

    const totalResults = TotalCourses + TotalClasses;
    const totalPages = Math.ceil(totalResults / pageSize);

    const data = [
      ...courses.map((course) => ({
        type: 'course',
        course_id: course.course_id,
        name: course.name,
        url_image: course.url_image,
        description: course.description,
        course_code: course.course_code,
        teacher: {
          id: course.teacher.teacher_id,
          name: course.teacher.name,
        },
      })),
      ...classes.map((cls) => ({
        type: 'class',
        class_id: cls.class_id,
        title: cls.title,
        course: { course_id: cls.course.course_id, name: cls.course.name },
        url_youtube: cls.url_youtube,
      })),
    ];
    return {
      data: data,
      page,
      totalPages,
      totalResults,
    };
  }
}
