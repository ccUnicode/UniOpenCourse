// 1. Decoradores de comunicación y extracción de datos
import { Post, Get, Patch, Delete, Body, Param, Query, Controller } from '@nestjs/common';
// 2. Inyección del servicio lógico
import { ClassesService } from './classes.service';
// 3. Moldes de seguridad (DTOs)
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

/**
 * CONTROLADOR ADMINISTRATIVO DE CLASES
 */
@Controller('admin/classes')
export class ClassesController {
  /**
   * - Inyección de ClassesService: Acceso a la lógica de negocio de lecciones.
   * - Modificador 'private readonly': Asegura una instancia única y protegida del servicio.
   */
  constructor(private readonly service: ClassesService) {}

  /**
   * Creación de Clases
   * - @Body: Transfiere el JSON de entrada al molde CreateClassDto.
   */
  @Post()
  create(@Body() createClassDto: CreateClassDto) {
    return this.service.create(createClassDto);
  }

  /**
   * Listado Paginado con Filtros
   * - @Query('search'): Captura el texto de búsqueda opcional.
   * - @Query('page'): Atrapa el número de página y lo convierte a entero (+).
   */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
  ) {
    return this.service.findAll(search, page ? +page : 1);
  }

  /**
   * Obtención de Clase Única
   * - @Get(':id'): Define un parámetro dinámico en la URL.
   * - @Param('id'): Recupera el ID y lo castea a número (+).
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  /**
   * Actualización de Clases
   * - @Param('id'): Identifica el recurso a modificar.
   * - @Body: Vierte los cambios parciales mediante UpdateClassDto.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.service.update(+id, updateClassDto);
  }

  /**
   * Eliminación de Clases
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
