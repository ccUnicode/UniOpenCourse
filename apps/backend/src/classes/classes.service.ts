import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async findAllByCourse(courseId: number) {
    return this.prisma.class.findMany({
      where: { course_id: courseId },
      select: {
        class_id: true,
        course_id: true,
        title: true,
        description: true,
        url_youtube: true,
        class_creation_date: true,
      },
      orderBy: { class_creation_date: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.class.findUnique({
      where: { class_id: id },
      include: { materials: true },
    });
  }

  async getMaterialsByClass(classId: number) {
    return this.prisma.material.findMany({
      where: { class_id: classId },
    });
  }
}
