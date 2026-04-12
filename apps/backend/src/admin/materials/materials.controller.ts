// --- IMPORTACIONES DEL NUCLEO WEB Y TRANSFERENCIA ---
// 1. Herramientas base de NestJS:
//    - `@Controller`, `@Post`, `@Delete`: Definen rutas y el verbo HTTP.
//    - `@Body`, `@Param`: Sacan datos del body y de la URL.
//    - `@UseInterceptors`, `@UploadedFile`: Manejan la subida de archivos.
import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

// 2. Herramientas Especializadas Binarias (Multer):
//    `FileInterceptor`: Lee el archivo que llega con el nombre de campo indicado.
import { FileInterceptor } from '@nestjs/platform-express';

// 3. Reglas de guardado:
//    Configura la carpeta y el nombre con el que se guarda el archivo.
import { storageConfig } from '../../utils/storage.config';

// 4. Servicio Principal y Moldes DTOs
import { MaterialsService } from './materials.service';
import { CreateFileDto } from './dto/create-file.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateReferenceDto } from './dto/create-reference.dto';

/**
 * CONTROLADOR ADMINISTRATIVO DE MATERIALES
 * Maneja la creacion de recursos (archivos, enlaces y referencias).
 */
@Controller('admin/materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  /**
   * ENDPOINT PARA SUBIDA DE ARCHIVOS FÍSICOS (POST)
   * 
   * ANÁLISIS SINTÁCTICO DE LA SUBIDA DE ARCHIVOS:
   * 
   * 1. `@UseInterceptors()`: Funciona como un "Portero". Su misión es detener el tráfico 
   *    antes de que llegue a esta función para que un especialista procese los datos pesados.
   * 
   * 2. `FileInterceptor('file', { storage: storageConfig })`: Es el "Ayudante Especializado" 
   *    que vive dentro del portero. 
   *    - El nombre `'file'` es la llave: debe coincidir exactamente con el nombre del campo 
   *      que envíe el Frontend (React). 
   *    - El objeto `{ storage }` es el manual de instrucciones que le dice dónde y cómo 
   *      guardar el archivo físicamente en el disco duro.
   * 
   * 3. `@UploadedFile()`: Una vez que el Portero y el Ayudante terminan su trabajo de guardado, 
   *    este decorador atrapa el "Resumen o Ticket" de éxito (que contiene el nombre final, 
   *    el tamaño y la ruta) y lo entrega a la variable `file`.
   */
  @Post('file')
  @UseInterceptors(FileInterceptor('file', { storage: storageConfig }))
  createFile(
    @Body() createFileDto: CreateFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.materialsService.createFile(createFileDto, file);
  }

  /**
   * ENDPOINT PARA CREACION DE ENLACES EXTERNOS (POST)
   * - `@Post('link')` indica la ruta: /admin/materials/link.
   * - `@Body()` espera un JSON con titulo y url.
   */
  @Post('link')
  createLink(@Body() createLinkDto: CreateLinkDto) {
    return this.materialsService.createLink(createLinkDto);
  }

  /**
   * ENDPOINT PARA REFERENCIAS DE TEXTO (POST)
   * - `@Post('reference')` indica la ruta: /admin/materials/reference.
   * - `@Body()` espera el texto de la referencia.
   */
  @Post('reference')
  createReference(@Body() createReferenceDto: CreateReferenceDto) {
    return this.materialsService.createReference(createReferenceDto);
  }

  /**
   * ENDPOINT PARA ELIMINACION (DELETE)
   * - `@Delete(':id')` crea la ruta /admin/materials/:id.
   * - `@Param('id')` saca el id de la URL como string.
   * - `+id` lo convierte a numero antes de enviarlo al servicio.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialsService.remove(+id);
  }
}
