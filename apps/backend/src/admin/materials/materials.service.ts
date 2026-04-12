// 1. Herramientas de NestJS y excepciones de red
import { Injectable, BadRequestException } from '@nestjs/common';
// 2. Servicio de base de datos
import { PrismaService } from '../../prisma.service';
// 3. Moldes de validación de datos (DTOs)
import { CreateFileDto } from './dto/create-file.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateReferenceDto } from './dto/create-reference.dto';

/**
 * SERVICIO ADMINISTRATIVO DE MATERIALES
 * Lógica de persistencia en BD para recursos de clase.
 */
@Injectable()
export class MaterialsService {
  /**
   * - Inyección de PrismaService: Permite interactuar con PostgreSQL mediante el ORM.
   * - Modificador 'private': Automatiza la creación de la variable interna de clase.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Registro de Archivo Físico
   * - BadRequestException: Protege el flujo si no se detecta la subida de un documento.
   * - material_type: Etiqueta el registro como 'file' para gestión en el frontend.
   * - url_link: Almacena el nombre del archivo físico generado en storageConfig.
   */
  async createFile(createFileDto: CreateFileDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo válido.');
    }

    return this.prisma.material.create({
      data: {
        class_id: createFileDto.class_id,
        material_type: 'file',
        filename: file.originalname,
        url_link: file.filename,
      },
    });
  }

  /**
   * Registro de Enlace Web
   * - ...createLinkDto: Usa el operador spread para volcar los datos del enlace.
   */
  async createLink(createLinkDto: CreateLinkDto) {
    return this.prisma.material.create({
      data: {
        ...createLinkDto,
        material_type: 'link',
      },
    });
  }

  /**
   * Registro de Referencias Bibliográficas
   */
  async createReference(createReferenceDto: CreateReferenceDto) {
    return this.prisma.material.create({
      data: {
        ...createReferenceDto,
        material_type: 'reference',
      },
    });
  }

  /**
   * Eliminación de Material
   */
  async remove(id: number) {
    return this.prisma.material.delete({
      where: { material_id: id },
    });
  }
}
