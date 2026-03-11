import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateCourseDto) {
    return await this.prisma.$transaction(async (tx) => {
      // Usamos transaction para asegurar que un docente se cree solo si el curso se crea correctamente
      let docenteId = data.id_docente;
      if (!docenteId) {
        if (!data.nombre_docente || !data.apellido_docente) {
          throw new Error(
            'Debe proporcionar el id_docente o el nombre_docente y apellido_docente',
          );
        }
        const docenteExistente = await tx.docente.findFirst({
          where: {
            nombres: data.nombre_docente,
            apellidos: data.apellido_docente,
          },
        });

        if (docenteExistente) {
          // Si el docente ya existe, usamos su ID
          docenteId = docenteExistente.id_docente;
        } else {
          // Creamos un nuevo docente y obtenemos su ID en caso de que no exista
          const nuevoDocente = await tx.docente.create({
            data: {
              nombres: data.nombre_docente,
              apellidos: data.apellido_docente,
            },
          });
          docenteId = nuevoDocente.id_docente;
        }
      }
      if (!docenteId) {
        // Si por alguna razón no se pudo determinar el ID del docente, lanzamos un error
        throw new Error('No se pudo determinar el ID del docente');
      }
      return await tx.curso.create({
        // Creamos el curso y lo asociamos al docente usando su ID
        data: {
          nombre: data.nombre,
          codigo_curso: data.codigo_curso,
          descripcion: data.descripcion,
          url_imagen: data.url_imagen || '',
          docente: {
            // Asociamos el curso al docente usando su ID
            connect: { id_docente: docenteId },
          },
        },
      });
    });
  }

  findAll() {
    return this.prisma.curso.findMany();
  }

  async update(id: string, data: CreateCourseDto) {
    return await this.prisma.$transaction(async (tx) => {
      let docenteId = data.id_docente;
      if (!docenteId && data.nombre_docente && data.apellido_docente) {
        const docenteExistente = await tx.docente.findFirst({
          where: {
            nombres: data.nombre_docente,
            apellidos: data.apellido_docente,
          },
        });
        if (docenteExistente) {
          // Si el docente ya existe, usamos su ID
          docenteId = docenteExistente.id_docente;
        } else {
          // Creamos un nuevo docente y obtenemos su ID en caso de que no exista
          const nuevoDocente = await tx.docente.create({
            data: {
              nombres: data.nombre_docente,
              apellidos: data.apellido_docente,
            },
          });
          docenteId = nuevoDocente.id_docente;
        }
      } else if (!docenteId && (!data.nombre_docente || !data.apellido_docente)) {
        throw new Error(
          'Debe proporcionar el id_docente o el nombre_docente y apellido_docente',
        );
      }

      return await tx.curso.update({
        where: { id_curso: Number(id) },
        data: {
          nombre: data.nombre,
          codigo_curso: data.codigo_curso,
          descripcion: data.descripcion,
          url_imagen: data.url_imagen,
          ...(docenteId && {
            docente: {
              connect: { id_docente: docenteId },
            },
          }),
        },
      });
    });
  }

  remove(id: string) {
    return 'Eliminando el curso con id ' + id;
  }
}
