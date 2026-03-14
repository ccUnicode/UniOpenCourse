import { Injectable } from '@nestjs/common';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClaseService {
  constructor(private prisma: PrismaService) {}

  async create(createClaseDto: CreateClaseDto) {
    return this.prisma.clase.create({
      data: createClaseDto,
    });
  }

  async findAll() {
    return this.prisma.clase.findMany();
  }

  async findOne(id: number) {
    return this.prisma.clase.findUnique({
      where: { id_clase: id },
    });
  }

  async update(id: number, updateClaseDto: UpdateClaseDto) {
    return this.prisma.clase.update({
      where: { id_clase: id },
      data: updateClaseDto,
    });
  }

  async remove(id: number) {
    return this.prisma.clase.delete({
      where: { id_clase: id },
    });
  }
}
