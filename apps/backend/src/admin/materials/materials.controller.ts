// 1. Herramientas de comunicación y extracción de datos
import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
// 2. Interceptor para manejo de archivos binarios
import { FileInterceptor } from '@nestjs/platform-express';
// 3. Configuración del destino y nombre del archivo
import { storageConfig } from '../../utils/storage.config';
// 4. Lógica de negocio y modelos de datos
import { MaterialsService } from './materials.service';
import { CreateFileDto } from './dto/create-file.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateReferenceDto } from './dto/create-reference.dto';

/**
 * CONTROLADOR ADMINISTRATIVO DE MATERIALES
 * Gestiona la creación y eliminación de recursos en el panel de control.
 */
@Controller('admin/materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  /**
   * Registro de Archivos Físicos (PDF, Imágenes, etc.)
   * - @UseInterceptors: Intercepta la petición para guardar el archivo en disco antes de leer los datos.
   * - @UploadedFile: Atrapa los metadatos del archivo guardado (ruta y nombre único) para el servicio.
   */
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storageConfig,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  )
  createFile(
    @Body() createFileDto: CreateFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.materialsService.createFile(createFileDto, file);
  }

  /**
   * Registro de Enlaces Externos
   * - @Body: Extrae el título y la URL del enlace para guardarlos en la tabla material.
   */
  @Post('link')
  createLink(@Body() createLinkDto: CreateLinkDto) {
    return this.materialsService.createLink(createLinkDto);
  }

  /**
   * Registro de Referencias de Texto
   * - @Body: Obtiene el texto literario o bibliográfico para persistencia.
   */
  @Post('reference')
  createReference(@Body() createReferenceDto: CreateReferenceDto) {
    return this.materialsService.createReference(createReferenceDto);
  }

  /**
   * Eliminación de Recursos
   * - @Delete(':id'): Captura el identificador dinámico desde la URL.
   * - +id: Convierte el parámetro de texto a número para la consulta en Prisma.
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.materialsService.remove(id);
  }
}
