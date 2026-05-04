import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Retrieves all classes for a specific course */
  async findAllByCourse(courseId: number) {
    return this.prisma.class.findMany({
      where: { course_id: courseId },
    });
  }

  /**
   * Retrieves a specific class by its ID, including its associated materials
   * @param id - The unique identifier of the class
   * @throws NotFoundException if the class is not found
   * @returns The class object with its materials
   */
  async findOne(id: number) {
    const classItem = await this.prisma.class.findUnique({
      where: { class_id: id },
      include: { materials: true },
    });

    if (!classItem) {
      throw new NotFoundException('Clase no encontrada');
    }

    return classItem;
  }

  /** Retrieves all materials linked to a specific class */
  async getMaterialsByClass(classId: number) {
    return this.prisma.material.findMany({
      where: { class_id: classId },
    });
  }
}
