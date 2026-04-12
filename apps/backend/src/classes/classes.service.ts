// 1. Decorador para inyección de dependencias
import { Injectable } from '@nestjs/common';
// 2. Conexión central a la base de datos mediante Prisma
import { PrismaService } from '../prisma.service';

/**
 * SERVICIO PÚBLICO DE CLASES
 * Provee la lógica de extracción de datos para las vistas del estudiante.
 */
@Injectable()
export class ClassesService {
  /**
   * - Inyección de PrismaService: Permite realizar consultas asíncronas a PostgreSQL.
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Listado de Clases por Curso
   * - findMany: Retorna el arreglo completo de lecciones que coincidan con el ID del curso.
   */
  async findAllByCourse(courseId: number) {
    return this.prisma.class.findMany({
      where: { course_id: courseId },
    });
  }

  /**
   * Detalle de Clase con Materiales Incluidos
   * - findUnique: Busca un registro único mediante su llave primaria (PK).
   * - include: Realiza un JOIN automático para traer los materiales vinculados en la misma respuesta.
   */
  async findOne(id: number) {
    return this.prisma.class.findUnique({
      where: { class_id: id },
      include: { materials: true },
    });
  }

  /**
   * Consulta de Materiales Independiente
   * - Accede directamente a la tabla 'material' filtrando por el ID de la clase padre.
   */
  async getMaterialsByClass(classId: number) {
    return this.prisma.material.findMany({
      where: { class_id: classId },
    });
  }
}
