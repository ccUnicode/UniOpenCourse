import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Prisma } from '../generated/prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { storageDir } from '../utils/storage.config';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Admin Methods ---
  async create(data: CreateCourseDto, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Debes adjuntar una imagen .jpeg o .png');
    }
    try {
      return await this.prisma.$transaction(async (tx) => {
        let docenteId = data.teacher_id;
        if (!docenteId) {
          if (!data.teacher_name || !data.teacher_last_name) {
            throw new BadRequestException(
              'Debe proporcionar el teacher_id o el nombre_docente y apellido_docente',
            );
          }
          const docenteExistente = await tx.teacher.findFirst({
            where: { name: data.teacher_name, last_name: data.teacher_last_name },
          });

          if (docenteExistente) {
            docenteId = docenteExistente.teacher_id;
          } else {
            const nuevoDocente = await tx.teacher.create({
              data: { name: data.teacher_name, last_name: data.teacher_last_name },
            });
            docenteId = nuevoDocente.teacher_id;
          }
        }
        if (!docenteId) {
          throw new BadRequestException('No se pudo determinar el ID del docente');
        }
        return await tx.course.create({
          data: {
            name: data.name,
            course_code: data.course_code,
            description: data.description,
            url_image: file.filename,
            teacher: { connect: { teacher_id: docenteId } },
          },
        });
      });
    } catch (error) {
      try {
        await unlink(join(storageDir, file.filename));
      } catch (unlinkError) {
        console.error(
          `No se pudo eliminar la imagen nueva: ${file.filename}`,
          unlinkError,
        );
      }
      throw error;
    }
  }

  async update(id: string, data: CreateCourseDto, file?: Express.Multer.File) {
    let imagenAnterior: string | null = null;
    try {
      const resultado = await this.prisma.$transaction(async (tx) => {
        const cursoExistente = await tx.course.findUnique({
          where: { course_id: Number(id) },
        });

        if (!cursoExistente) {
          throw new NotFoundException(`El curso con ID ${id} no existe.`);
        }

        let docenteId = data.teacher_id;

        if (!docenteId && data.teacher_name && data.teacher_last_name) {
          const docenteExistente = await tx.teacher.findFirst({
            where: {
              name: data.teacher_name,
              last_name: data.teacher_last_name,
            },
          });

          if (docenteExistente) {
            docenteId = docenteExistente.teacher_id;
          } else {
            const nuevoDocente = await tx.teacher.create({
              data: {
                name: data.teacher_name,
                last_name: data.teacher_last_name,
              },
            });

            docenteId = nuevoDocente.teacher_id;
          }
        }

        const cursoActualizado = await tx.course.update({
          where: { course_id: Number(id) },
          data: {
            name: data.name,
            course_code: data.course_code,
            description: data.description,
            ...(docenteId && {
              teacher: {
                connect: {
                  teacher_id: docenteId,
                },
              },
            }),
            ...(file && {
              url_image: file.filename,
            }),
          },
        });
        imagenAnterior = cursoExistente.url_image;
        return cursoActualizado;
      });
      if (file && imagenAnterior) {
        try {
          await unlink(join(storageDir, imagenAnterior));
        } catch (error) {
          console.error('No se pudo eliminar la imagen anterior:', imagenAnterior, error);
        }
      }
      return resultado;
    } catch (error) {
      if (file) {
        try {
          await unlink(join(storageDir, file.filename));
        } catch (unlinkError) {
          console.error(
            'No se pudo eliminar la imagen nueva:',
            file.filename,
            unlinkError,
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const curso = await this.prisma.course.findUnique({
        where: {
          course_id: Number(id),
        },
        select: {
          url_image: true,
        },
      });
      if (!curso) {
        throw new NotFoundException(`El curso con ID ${id} no existe.`);
      }
      const imagen = curso.url_image;
      const cursoEliminado = await this.prisma.course.delete({
        where: { course_id: Number(id) },
      });
      if (imagen) {
        try {
          await unlink(join(storageDir, imagen));
        } catch (error) {
          console.error(`No se pudo eliminar la imagen del curso: ${imagen}`, error);
        }
      }
      return cursoEliminado;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`El curso con ID ${id} no existe.`);
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'No se puede eliminar el curso porque tiene clases o registros asociados. Elimina primero sus dependencias.',
          );
        }
      }
      throw error;
    }
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { course_id: Number(id) },
      select: {
        course_id: true,
        name: true,
        course_code: true,
        description: true,
        url_image: true,
        teacher_id: true,
        teacher: {
          select: { teacher_id: true, name: true, last_name: true },
        },
      },
    });
  }

  // --- Public / Shared Methods ---
  async findAll(page = 1, limit = 6, q?: string) {
    const skip = (page - 1) * limit;
    const query = q?.trim();
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
          course_creation_date: true,
          update_date: true,
          teacher: {
            select: {
              name: true,
              last_name: true,
            },
          },
        },
        orderBy: { course_creation_date: 'desc' },
      }),
      this.prisma.course.count({ where }),
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
    return this.prisma.course.findMany({
      take: limit,
      select: {
        course_id: true,
        name: true,
        course_code: true,
        url_image: true,
        description: true,
        teacher_id: true,
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
          select: { class_id: true, title: true },
          orderBy: { class_creation_date: 'asc' },
        },
        teacher: {
          select: { teacher_id: true, name: true, last_name: true },
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
        user_id_course_id: { user_id: userId, course_id: courseId },
      },
      update: { last_visit_date: new Date() },
      create: { user_id: userId, course_id: courseId },
    });

    return visit;
  }

  async getVisitsByCourseId(courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: { course_id: courseId },
      select: { course_id: true, name: true },
    });

    if (!course) throw new NotFoundException('Curso no encontrado');

    const visitas = await this.prisma.lastCourseVisit.findMany({
      where: { course_id: courseId },
      select: {
        user_course_id: true,
        user_id: true,
        start_date: true,
        last_visit_date: true,
        user: {
          select: { user_id: true, username: true, name: true, last_name: true },
        },
      },
      orderBy: { last_visit_date: 'desc' },
    });

    return {
      curso: { id_curso: course.course_id, nombre: course.name },
      total: visitas.length,
      detalle: visitas,
    };
  }

  async getUserDashboard(userId: number) {
    const visits = await this.prisma.lastCourseVisit.findMany({
      where: { user_id: userId },
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
            teacher: {
              select: {
                name: true,
                last_name: true,
              },
            },
          },
        },
      },
      orderBy: { last_visit_date: 'desc' },
    });

    return {
      userId,
      totalCourses: visits.length,
      courses: visits.map((v) => ({
        course_id: v.course.course_id,
        name: v.course.name,
        course_code: v.course.course_code,
        url_image: v.course.url_image,
        description: v.course.description,
        start_date: v.start_date,
        last_visit_date: v.last_visit_date,
        teacher: {
          name: v.course.teacher.name,
          last_name: v.course.teacher.last_name,
        },
      })),
    };
  }
}
