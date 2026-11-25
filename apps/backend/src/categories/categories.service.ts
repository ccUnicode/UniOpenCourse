import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Listar todas las categorías disponibles (público / selectores / estudiantes)
   */
  async findAllPublic() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        category_id: true,
        name: true,
        description: true,
        creation_date: true,
      },
    });
  }

  /**
   * Listado administrativo paginado con búsqueda por nombre y conteo de cursos asociados
   */
  async findAllAdmin(page = 1, limit = 10, q?: string) {
    const skip = (page - 1) * limit;
    const query = q?.trim();
    const where = query
      ? {
          name: { contains: query, mode: 'insensitive' as const },
        }
      : undefined;

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: limit,
        where,
        select: {
          category_id: true,
          name: true,
          description: true,
          creation_date: true,
          _count: {
            select: {
              courses: true,
            },
          },
        },
        orderBy: { creation_date: 'desc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Crear una nueva categoría
   */
  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name.trim(),
          description: dto.description.trim(),
        },
        select: {
          category_id: true,
          name: true,
          description: true,
          creation_date: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Ya existe una categoría con el nombre "${dto.name.trim()}".`,
        );
      }
      throw error;
    }
  }

  /**
   * Obtener detalle de una categoría con sus cursos asignados
   */
  async findOneAdmin(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { category_id: id },
      select: {
        category_id: true,
        name: true,
        description: true,
        creation_date: true,
        courses: {
          select: {
            course_id: true,
            name: true,
            course_code: true,
            url_image: true,
            description: true,
          },
          orderBy: { course_creation_date: 'desc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`La categoría con ID ${id} no existe.`);
    }

    return category;
  }

  /**
   * Actualizar datos de categoría y/o vincular/desvincular cursos
   */
  async updateAdmin(id: number, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { category_id: id },
    });

    if (!existing) {
      throw new NotFoundException(`La categoría con ID ${id} no existe.`);
    }

    try {
      return await this.prisma.category.update({
        where: { category_id: id },
        data: {
          ...(dto.name !== undefined && { name: dto.name.trim() }),
          ...(dto.description !== undefined && {
            description: dto.description.trim(),
          }),
          ...(dto.course_ids !== undefined && {
            courses: {
              set: dto.course_ids.map((courseId) => ({ course_id: courseId })),
            },
          }),
        },
        select: {
          category_id: true,
          name: true,
          description: true,
          creation_date: true,
          courses: {
            select: {
              course_id: true,
              name: true,
              course_code: true,
              url_image: true,
              description: true,
            },
            orderBy: { course_creation_date: 'desc' },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Ya existe una categoría con el nombre "${dto.name?.trim()}".`,
        );
      }
      throw error;
    }
  }

  /**
   * Eliminar una categoría sin afectar los cursos existentes
   */
  async remove(id: number) {
    try {
      return await this.prisma.category.delete({
        where: { category_id: id },
        select: {
          category_id: true,
          name: true,
          description: true,
          creation_date: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`La categoría con ID ${id} no existe.`);
      }
      throw error;
    }
  }
}
