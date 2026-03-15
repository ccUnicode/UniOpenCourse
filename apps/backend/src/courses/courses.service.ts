import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 6) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.curso.findMany({
        skip,
        take: limit,
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
      }),
      this.prisma.curso.count(),
    ]);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findForCarousel(limit = 5) {
    return this.prisma.curso.findMany({
      take: limit,
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
      orderBy: { usuarios_visitantes: { _count: 'desc' } },
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

  async registerVisit(courseId: number, userId: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: courseId },
      select: { id_curso: true },
    });

    if (!curso) throw new NotFoundException('Curso no encontrado');

    const visit = await this.prisma.ultimaVisitaCurso.upsert({
      where: {
        id_usuario_id_curso: {
          id_usuario: userId,
          id_curso: courseId,
        },
      },
      update: {
      fecha_ultima_visita: new Date(),
      },
      create: {
        id_usuario: userId,
        id_curso: courseId,
      },
    });

    return visit;
  }

  async getVisitsByCourseId(courseId: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: courseId },
      select: { id_curso: true, nombre: true },
    });

    if (!curso) throw new NotFoundException('Curso no encontrado');

    const visitas = await this.prisma.ultimaVisitaCurso.findMany({
      where: { id_curso: courseId },
      select: {
        id_usuario_curso: true,
        id_usuario: true,
        fecha_inicio: true,
        fecha_ultima_visita: true,
        usuario: {
          select: {
            id_usuario: true,
            nombre_usuario: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
      orderBy: { fecha_ultima_visita: 'desc' },
    });

    return {
      curso: { id_curso: curso.id_curso, nombre: curso.nombre },
      total: visitas.length,
      detalle: visitas,
    };
  }
}
