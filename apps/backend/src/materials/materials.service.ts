import 'multer';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StorageCleanupService } from '../storage/storage-cleanup.service';
import { StorageService } from '../storage/storage.service';
import { CreateFileDto } from './dto/create-file.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { MaterialTypes, Prisma } from '../generated/prisma';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cleanup: StorageCleanupService,
  ) {}

  /**
   * Retrieves paginated materials, optionally filtered by class_id or filename search
   * Includes class title and course details
   */
  async findAll(search?: string, classId?: number, page: number = 1, limit: number = 10) {
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10;
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.MaterialWhereInput = {};

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { class: { title: { contains: search, mode: 'insensitive' } } },
        { class: { course: { name: { contains: search, mode: 'insensitive' } } } },
        { class: { course: { course_code: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (classId) {
      where.class_id = Number(classId);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.material.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { material_creation_date: 'desc' },
        include: {
          class: {
            select: {
              title: true,
              course: {
                select: { name: true, course_code: true },
              },
            },
          },
        },
      }),
      this.prisma.material.count({ where }),
    ]);

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  /**
   * Creates a new physical file material and uploads it to Cloudflare R2
   * @param createFileDto - Data containing the class_id and filename
   * @param file - The uploaded file object
   * @throws BadRequestException if the file is missing or invalid
   * @returns The newly created material record
   */
  async createFile(createFileDto: CreateFileDto, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo válido.');
    }

    const uploadResult = await this.storageService.uploadFile(file, 'materials');

    try {
      return await this.prisma.material.create({
        data: {
          class_id: createFileDto.class_id,
          material_type: MaterialTypes.file,
          filename: createFileDto.filename,
          file_path: uploadResult.url,
        },
      });
    } catch (error) {
      await this.cleanup.discardUpload(uploadResult.url);
      throw error;
    }
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

  /** Deletes a material by its ID and unlinks its physical file (from R2 or local storage) */
  async remove(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { material_id: id },
    });

    if (!material) {
      throw new NotFoundException('Material no encontrado.');
    }

    // Limpieza previa del archivo físico antes de borrar el registro de la base de datos
    if (material.material_type === MaterialTypes.file && material.file_path) {
      try {
        const fileDeleted = await this.storageService.deleteFile(material.file_path);
        if (!fileDeleted) {
          this.logger.error(
            `No se pudo eliminar el archivo físico del almacenamiento: ${material.file_path}`,
          );
          throw new InternalServerErrorException(
            'No se pudo eliminar el archivo del almacenamiento. Operación cancelada para reintento.',
          );
        }
      } catch (storageError) {
        if (storageError instanceof InternalServerErrorException) {
          throw storageError;
        }
        this.logger.error(
          `Error al intentar eliminar el archivo físico: ${material.file_path}`,
          storageError,
        );
        throw new InternalServerErrorException(
          'No se pudo eliminar el archivo del almacenamiento. Operación cancelada para reintento.',
        );
      }
    }

    const deleted = await this.prisma.material.delete({
      where: { material_id: id },
    });

    return deleted;
  }

  /** Gets the downloadable file information (either Cloudflare R2 stream or local read stream) */
  async getDownloadableFile(id: number): Promise<{
    stream: Readable;
    filename: string;
  }> {
    const material = await this.prisma.material.findUnique({
      where: { material_id: id },
    });

    if (!material) {
      throw new NotFoundException('Material no encontrado.');
    }

    if (material.material_type !== MaterialTypes.file || !material.file_path) {
      throw new BadRequestException('Este material no es un archivo descargable.');
    }

    let filename = material.filename || 'material';

    let ext = '';
    try {
      if (
        material.file_path.startsWith('http://') ||
        material.file_path.startsWith('https://')
      ) {
        ext = path.extname(new URL(material.file_path).pathname);
      } else {
        ext = path.extname(material.file_path);
      }
    } catch {
      ext = '';
    }
    if (!path.extname(filename) && ext) {
      filename += ext;
    }

    const stream = await this.storageService.getFileStream(material.file_path);
    if (!stream) {
      throw new NotFoundException('El archivo físico no se encuentra en el servidor.');
    }

    return {
      stream,
      filename,
    };
  }
}
