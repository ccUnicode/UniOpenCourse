import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { paginatedResponse } from '../common/helpers/pagination.helper';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 6, search?: string) {
    const skip = (page - 1) * limit;
    const query = search?.trim();
    const where = query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { course_code: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        skip,
        take: limit,
        where,
        select: {
          course_id: true,
          name: true,
          course_code: true,
          url_image: true,
          description: true,
          teacher_id: true,
          course_creation_date: true,
          update_date: true,
        },
        orderBy: { course_creation_date: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);
    return paginatedResponse(data, total, page, limit);
  }

  async findForCarousel(limit = 5) {
    return this.prisma.course.findMany({
      take: limit,
      select: {
        course_id: true,
        name: true,
        course_code: true,
        url_image: true,
        description: true,
        teacher_id: true,
        course_creation_date: true,
        update_date: true,
      },
      orderBy: { visiting_users: { _count: 'desc' } },
    });
  }

  async findOneById(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { course_id: id },
      select: {
        course_id: true,
        name: true,
        course_code: true,
        url_image: true,
        description: true,
        teacher_id: true,
        course_creation_date: true,
        update_date: true,
        classes: {
          select: {
            class_id: true,
            title: true,
          },
          orderBy: { class_creation_date: 'asc' },
        },
        teacher: {
          select: {
            teacher_id: true,
            name: true,
            last_name: true,
          },
        },
      },
    });

    if (!course) throw new NotFoundException('Curso no encontrado');
    return course;
  }

  async registerVisit(courseId: number, userId: number) {
    const course = await this.prisma.course.findUnique({
      where: { course_id: courseId },
      select: { course_id: true },
    });

    if (!course) throw new NotFoundException('Curso no encontrado');

    const visit = await this.prisma.lastCourseVisit.upsert({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId,
        },
      },
      update: {
        last_visit_date: new Date(),
      },
      create: {
        user_id: userId,
        course_id: courseId,
      },
    });

    return visit;
  }

  async getVisitsByCourseId(courseId: number, page = 1, limit = 6) {
    const course = await this.prisma.course.findUnique({
      where: { course_id: courseId },
      select: { course_id: true },
    });

    if (!course) throw new NotFoundException('Curso no encontrado');

    const skip = (page - 1) * limit;
    const where = { course_id: courseId };

    const [data, total] = await Promise.all([
      this.prisma.lastCourseVisit.findMany({
        where,
        skip,
        take: limit,
        select: {
          user_course_id: true,
          user_id: true,
          start_date: true,
          last_visit_date: true,
          user: {
            select: {
              user_id: true,
              username: true,
              name: true,
              last_name: true,
            },
          },
        },
        orderBy: { last_visit_date: 'desc' },
      }),
      this.prisma.lastCourseVisit.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async getUserDashboard(userId: number, page = 1, limit = 6) {
    const skip = (page - 1) * limit;
    const where = { user_id: userId };

    const [visits, total] = await Promise.all([
      this.prisma.lastCourseVisit.findMany({
        where,
        skip,
        take: limit,
        select: {
          course_id: true,
          start_date: true,
          last_visit_date: true,
          course: {
            select: {
              course_id: true,
              name: true,
              course_code: true,
              url_image: true,
              description: true,
              teacher_id: true,
              course_creation_date: true,
              update_date: true,
            },
          },
        },
        orderBy: { last_visit_date: 'desc' },
      }),
      this.prisma.lastCourseVisit.count({ where }),
    ]);

    const data = visits.map((v) => ({
      course_id: v.course.course_id,
      name: v.course.name,
      course_code: v.course.course_code,
      url_image: v.course.url_image,
      description: v.course.description,
      teacher_id: v.course.teacher_id,
      course_creation_date: v.course.course_creation_date,
      update_date: v.course.update_date,
      start_date: v.start_date,
      last_visit_date: v.last_visit_date,
    }));

    return paginatedResponse(data, total, page, limit);
  }
}
