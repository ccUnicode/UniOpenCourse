import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateReferenceDto } from './dto/create-reference.dto';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  /** Creates a new physical file material */
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

  /** Creates a new external link material */
  async createLink(createLinkDto: CreateLinkDto) {
    return this.prisma.material.create({
      data: {
        ...createLinkDto,
        material_type: 'link',
      },
    });
  }

  /** Creates a new text reference material */
  async createReference(createReferenceDto: CreateReferenceDto) {
    return this.prisma.material.create({
      data: {
        ...createReferenceDto,
        material_type: 'reference',
      },
    });
  }

  /** Deletes a material by its ID */
  async remove(id: number) {
    return this.prisma.material.delete({
      where: { material_id: id },
    });
  }
}
