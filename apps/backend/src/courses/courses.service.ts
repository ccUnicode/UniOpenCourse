import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.curso.findMany({
      select: {
        id_curso: true,
        nombre: true,
        codigo_curso: true,
        url_imagen: true,
        descripcion: true,
        id_docente: true,
        fecha_creacion_curso: true,
        fecha_actualizacion: true,
      },
      orderBy: { fecha_creacion_curso: 'desc' },
    });
  }

  async findOneById(id: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: id },
      select: {
        id_curso: true,
        nombre: true,
        codigo_curso: true,
        url_imagen: true,
        descripcion: true,
        id_docente: true,
        fecha_creacion_curso: true,
        fecha_actualizacion: true,
      },
    });

    if (!curso) throw new NotFoundException('Curso no encontrado');
    return curso;
  }
}
