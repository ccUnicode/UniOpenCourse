import 'multer';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage/storage.service';
import { CreateFileDto } from './dto/create-file.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { MaterialTypes, Prisma } from '../generated/prisma';
import * as fs from 'fs';
import * as path from 'path';
import type { ReadStream } from 'fs';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
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
      try {
        await this.storageService.deleteFile(uploadResult.url);
      } catch (cleanupError) {
        this.logger.error(
          `No se pudo eliminar el archivo de R2 tras fallo: ${uploadResult.url}`,
          cleanupError,
        );
      }
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

  /** Gets the downloadable file information (either Cloudflare R2 URL or local read stream) */
  async getDownloadableFile(id: number): Promise<{
    url?: string;
    stream?: ReadStream;
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

    const isCloudflareUrl =
      (material.file_path.startsWith('http://') ||
        material.file_path.startsWith('https://')) &&
      !material.file_path.includes('/storage/') &&
      !material.file_path.includes('localhost');

    if (isCloudflareUrl) {
      const urlExt = path.extname(new URL(material.file_path).pathname);
      if (!path.extname(filename) && urlExt) {
        filename += urlExt;
      }
      return {
        url: material.file_path,
        filename,
      };
    }

    const storagePath = this.configService.get<string>(
      'STORAGE_PATH',
      path.join(process.cwd(), 'storage'),
    );

    let relativePath = material.file_path;
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      const parsed = new URL(relativePath);
      relativePath = parsed.pathname.replace(/^\/storage\//, '').replace(/^\//, '');
    } else {
      relativePath = relativePath.replace(/^\/?storage\//, '');
    }

    const filePath = path.join(storagePath, relativePath);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('El archivo físico no se encuentra en el servidor.');
    }

    const extension = path.extname(filePath);
    if (!path.extname(filename) && extension) {
      filename += extension;
    }

    return {
      stream: fs.createReadStream(filePath),
      filename,
    };
  }
}
