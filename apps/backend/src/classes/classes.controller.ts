// 1. Importamos el servicio de clases
import { ClassesService } from './classes.service';
// 2. Importamos los decoradores de NestJS para definir rutas y capturar parámetros
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'; 

/**
 * CONTROLADOR PÚBLICO DE CLASES
 * Gestiona las rutas de lectura para que los estudiantes consulten el contenido.
 */
@Controller()
export class ClassesController {
  /**
   * - Inyección de ClassesService: Acceso a las consultas DB de lecciones y materiales.
   */
  constructor( private readonly classesService: ClassesService) {}

  /**
   * Listado de Clases por Curso
   * - @Get('courses/:id/classes'): Ruta jerárquica para obtener lecciones de un curso específico.
   * - +id: Convierte el ID de la URL a número para la consulta.
   */
  @Get('courses/:id/classes')
  findAllByCourse(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findAllByCourse(id);
  }

  /**
   * Detalle de una Clase Específica
   * - @Get('classes/:id'): Obtiene el título, descripción y video de una lección puntual.
   */
  @Get('classes/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOne(id);
  }

  /**
   * Listado de Materiales de una Clase
   * - @Get('classes/:id/materials'): Recupera los recursos (PDFs, links, etc.) vinculados a la clase.
   */
  @Get('classes/:id/materials')
  getMaterialsByClass(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.getMaterialsByClass(id);
  }
}
