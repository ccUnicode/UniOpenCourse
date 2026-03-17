import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  findOne(id: number) {
    return this.prisma.material.findUnique({
      where: { material_id: id },
    });
  }
}
