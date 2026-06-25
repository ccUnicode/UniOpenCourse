<<<<<<< HEAD
import 'multer';
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
=======
import { Injectable, BadRequestException } from '@nestjs/common';
>>>>>>> 7679e1de544fb866a1f24f672d2168b09315a29b
import { PrismaService } from '../../prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateReferenceDto } from './dto/create-reference.dto';
<<<<<<< HEAD
import { MaterialTypes } from '../../generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new physical file material
   * @param createFileDto - Data containing the class_id
   * @param file - The uploaded file object
   * @throws BadRequestException if the file is missing or invalid
   * @returns The newly created material record
   */
  async createFile(createFileDto: CreateFileDto, file?: Express.Multer.File) {
=======

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async createFile(createFileDto: CreateFileDto, file: Express.Multer.File) {
>>>>>>> 7679e1de544fb866a1f24f672d2168b09315a29b
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo válido.');
    }

    return this.prisma.material.create({
      data: {
        class_id: createFileDto.class_id,
<<<<<<< HEAD
        material_type: MaterialTypes.file,
        filename: file.originalname,
        url_link: file.filename,
=======
        material_type: 'file',
        filename: file.originalname,
        file_path: file.filename,
>>>>>>> 7679e1de544fb866a1f24f672d2168b09315a29b
      },
    });
  }

<<<<<<< HEAD
  /** Creates a new external link material */
=======
>>>>>>> 7679e1de544fb866a1f24f672d2168b09315a29b
  async createLink(createLinkDto: CreateLinkDto) {
    return this.prisma.material.create({
      data: {
        ...createLinkDto,
<<<<<<< HEAD
        material_type: MaterialTypes.link,
=======
        material_type: 'link',
>>>>>>> 7679e1de544fb866a1f24f672d2168b09315a29b
      },
    });
  }

<<<<<<< HEAD
  /** Creates a new text reference material */
=======
>>>>>>> 7679e1de544fb866a1f24f672d2168b09315a29b
  async createReference(createReferenceDto: CreateReferenceDto) {
    return this.prisma.material.create({
      data: {
        ...createReferenceDto,
<<<<<<< HEAD
        material_type: MaterialTypes.reference,
=======
        material_type: 'reference',
>>>>>>> 7679e1de544fb866a1f24f672d2168b09315a29b
      },
    });
  }

<<<<<<< HEAD
  /** Deletes a material by its ID and unlinks its physical file if applicable */
  async remove(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { material_id: id },
    });

    if (!material) {
      throw new NotFoundException('Material no encontrado.');
    }

    if (material.material_type === MaterialTypes.file && material.url_link) {
      const filePath = path.join('./storage', material.url_link);
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (error) {
        this.logger.error(
          `Error deleting physical file: ${filePath}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

=======
  async remove(id: number) {
>>>>>>> 7679e1de544fb866a1f24f672d2168b09315a29b
    return this.prisma.material.delete({
      where: { material_id: id },
    });
  }
}
