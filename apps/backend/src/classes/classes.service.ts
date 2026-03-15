import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async findAllByCourse(courseId: number) {
    return this.prisma.clase.findMany({
      where: { id_curso: courseId },
      include: { materiales: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.clase.findUnique({
      where: { id_clase: id },
      include: { materiales: true },
    });
  }

  async getMaterialsByClass(classId: number) {
    return this.prisma.material.findMany({
      where: { id_clase: classId },
    });
  }
}
