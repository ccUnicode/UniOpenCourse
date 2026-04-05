import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByCourse(courseId: number) {
    return this.prisma.class.findMany({
      where: { course_id: courseId },
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
