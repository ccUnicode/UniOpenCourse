import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SearchDto } from './dto/global-search.dto';
import { GlobalSearchItem } from './interfaces/global-search.interface';

@Injectable()
export class GlobalSearcherService {
  constructor(private prisma: PrismaService) {}
  async search(query: SearchDto) {
    const MAX_PAGE = 1000;
    const RESULTS_PER_PAGE = 6;
    const RESULT_PER_TYPE = Math.ceil(RESULTS_PER_PAGE / 2);

    const { search_query, page = 1 } = query;

    const safePage = Math.max(1, Math.min(MAX_PAGE, page));
    const offset = (safePage - 1) * RESULT_PER_TYPE;

    const searchFilter = {
      contains: search_query,
      mode: 'insensitive' as const,
    };

    const [totalCourses, totalClasses, courses, classes] = await Promise.all([
      this.prisma.course.count({
        where: {
          OR: [{ name: searchFilter }, { course_code: searchFilter }],
        },
      }),
      this.prisma.class.count({
        where: { title: searchFilter },
      }),

      this.prisma.course.findMany({
        where: {
          OR: [{ name: searchFilter }, { course_code: searchFilter }],
        },
        orderBy: { course_creation_date: 'desc' },
        skip: offset,
        take: RESULT_PER_TYPE,
        include: {
          teacher: true,
        },
      }),
      this.prisma.class.findMany({
        where: { title: searchFilter },
        orderBy: { class_creation_date: 'desc' },
        skip: offset,
        take: RESULT_PER_TYPE,
        include: {
          course: true,
        },
      }),
    ]);

    const totalResults = totalCourses + totalClasses;
    const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

    const data: GlobalSearchItem[] = [
      ...courses.map<GlobalSearchItem>((course) => ({
        type: 'course',
        id: course.course_id,
        title: course.name,
        subtitle: course.teacher.name,
        image: course.url_image,
        meta: course.course_code,
      })),
      ...classes.map<GlobalSearchItem>((cls) => ({
        type: 'class',
        id: cls.class_id,
        title: cls.title,
        subtitle: cls.course.name,
        image: cls.course.url_image,
        meta: cls.course.course_code,
      })),
    ];
    return {
      data: data,
      page: safePage,
      totalPages,
      totalResults,
    };
  }
}
