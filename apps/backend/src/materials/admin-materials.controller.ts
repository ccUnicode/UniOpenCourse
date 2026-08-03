import 'multer';

import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from '../utils/storage.config';
import { MaterialsService } from './materials.service';
import { CreateFileDto } from './dto/create-file.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/materials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminMaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  /**
   * Uploads a physical file material and saves it to local storage
   * @param createFileDto - The material metadata (e.g. class_id)
   * @param file - The file object extracted by Multer
   * @returns The newly created file material record
   */
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storageConfig,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
        if (!allowed.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Tipo de archivo no permitido. Solo se aceptan PDFs, PNGs y JPEGs.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  createFile(
    @Body() createFileDto: CreateFileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo es obligatorio.');
    }
    return this.materialsService.createFile(createFileDto, file);
  }

  /** Creates an external link material */
  @Post('link')
  createLink(@Body() createLinkDto: CreateLinkDto) {
    return this.materialsService.createLink(createLinkDto);
  }

  /** Creates a text reference material */
  @Post('reference')
  createReference(@Body() createReferenceDto: CreateReferenceDto) {
    return this.materialsService.createReference(createReferenceDto);
  }

  /** Deletes a material by its ID */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.materialsService.remove(id);
  }
}
