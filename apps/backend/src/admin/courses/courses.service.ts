import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateCourseDto) {
    return await this.prisma.$transaction(async (tx) => {
      // Usamos transaction para asegurar que un docente se cree solo si el curso se crea correctamente
      let docenteId = data.teacher_id;
      if (!docenteId) {
        if (!data.teacher_name || !data.teacher_last_name) {
          throw new Error(
            'Debe proporcionar el teacher_id o el nombre_docente y apellido_docente',
          );
        }
        const docenteExistente = await tx.teacher.findFirst({
          where: {
            name: data.teacher_name,
            last_name: data.teacher_last_name,
          },
        });

        if (docenteExistente) {
          // Si el docente ya existe, usamos su ID
          docenteId = docenteExistente.teacher_id;
        } else {
          // Creamos un nuevo docente y obtenemos su ID en caso de que no exista
          const nuevoDocente = await tx.teacher.create({
            data: {
              name: data.teacher_name,
              last_name: data.teacher_last_name,
            },
          });
          docenteId = nuevoDocente.teacher_id;
        }
      }
      if (!docenteId) {
        // Si por alguna razón no se pudo determinar el ID del docente, lanzamos un error
        throw new Error('No se pudo determinar el ID del docente');
      }
      return await tx.course.create({
        // Creamos el curso y lo asociamos al docente usando su ID
        data: {
          name: data.name,
          course_code: data.course_code,
          description: data.description,
          url_image: data.url_image || '',
          teacher: {
            // Asociamos el curso al docente usando su ID
            connect: { teacher_id: docenteId },
          },
        },
      });
    });
  }

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

  findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { course_id: Number(id) },
      select: {
        course_id: true,
        name: true,
        course_code: true,
        teacher_id: true,
        teacher: {
          select: {
            teacher_id: true,
            name: true,
            last_name: true,
          },
        },
      },
    });
  }

  async update(id: string, data: CreateCourseDto) {
    return await this.prisma.$transaction(async (tx) => {
      let docenteId = data.teacher_id;
      if (!docenteId && data.teacher_name && data.teacher_last_name) {
        const docenteExistente = await tx.teacher.findFirst({
          where: {
            name: data.teacher_name,
            last_name: data.teacher_last_name,
          },
        });
        if (docenteExistente) {
          // Si el docente ya existe, usamos su ID
          docenteId = docenteExistente.teacher_id;
        } else {
          // Creamos un nuevo docente y obtenemos su ID en caso de que no exista
          const nuevoDocente = await tx.teacher.create({
            data: {
              name: data.teacher_name,
              last_name: data.teacher_last_name,
            },
          });
          docenteId = nuevoDocente.teacher_id;
        }
      }

      return await tx.course.update({
        where: { course_id: Number(id) },
        data: {
          name: data.name,
          course_code: data.course_code,
          description: data.description,
          url_image: data.url_image,
          ...(docenteId && {
            teacher: {
              connect: { teacher_id: docenteId },
            },
          }),
        },
      });
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.course.delete({
        where: { course_id: Number(id) },
      });
    } catch (error) {
      // Error P2025: El registro no existe
      if (error.code === 'P2025') {
        throw new NotFoundException(`El curso con ID ${id} no existe.`);
      }
      // Error P2003: Fallo de restricción de llave foránea (tiene clases hijas)
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'No se puede eliminar el curso porque tiene clases o registros asociados. Elimina primero sus dependencias.',
        );
      }
      throw error;
    }
  }
}
