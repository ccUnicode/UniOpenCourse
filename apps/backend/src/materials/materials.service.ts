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
   * Retrieves paginated materials, optionally filtered by class_id or filename search
   * Includes class title and course details
   */
  async findAll(search?: string, classId?: number, page: number = 1, limit: number = 10) {
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10;
    const skip = (safePage - 1) * safeLimit;

    const where: any = {};

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
        class_id: Number(createFileDto.class_id),
        material_type: MaterialTypes.file,
        filename: file.originalname,
        url_link: file.filename,
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

    return this.prisma.material.delete({
      where: { material_id: id },
    });
  }
}
