import 'multer';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { MaterialTypes } from '../generated/prisma/client';
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
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo válido.');
    }

    return this.prisma.material.create({
      data: {
        class_id: createFileDto.class_id,
        material_type: MaterialTypes.file,
        filename: file.originalname,
        file_path: file.filename,
      },
    });
  }

  /** Creates a new external link material */
  async createLink(createLinkDto: CreateLinkDto) {
    return this.prisma.material.create({
      data: {
        ...createLinkDto,
        material_type: MaterialTypes.link,
      },
    });
  }

  /** Creates a new text reference material */
  async createReference(createReferenceDto: CreateReferenceDto) {
    return this.prisma.material.create({
      data: {
        ...createReferenceDto,
        material_type: MaterialTypes.reference,
      },
    });
  }

  /** Deletes a material by its ID and unlinks its physical file if applicable */
  async remove(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { material_id: id },
    });

    if (!material) {
      throw new NotFoundException('Material no encontrado.');
    }

    if (material.material_type === MaterialTypes.file && material.file_path) {
      const filePath = path.join('./storage', material.file_path);
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

    return this.prisma.material.delete({
      where: { material_id: id },
    });
  }

  /** Gets the read stream and original filename for a physical material file */
  async getDownloadableFile(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { material_id: id },
    });

    if (!material) {
      throw new NotFoundException('Material no encontrado.');
    }

    // Usamos file_path en lugar de url_link como estaba en la rama anterior
    if (material.material_type !== MaterialTypes.file || !material.file_path) {
      throw new BadRequestException('Este material no es un archivo descargable.');
    }

    const filePath = path.join(process.cwd(), 'storage', material.file_path);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('El archivo físico no se encuentra en el servidor.');
    }

    return {
      stream: fs.createReadStream(filePath),
      filename: material.filename || material.file_path,
    };
  }
}
