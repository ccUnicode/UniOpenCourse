import { Injectable } from '@nestjs/common';
import {PrismaService} from '../../prisma.service';
import {CreateClassDto} from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
@Injectable()
export class ClassesService {
    constructor (private prisma: PrismaService) {};
    async create(createClassDto: CreateClassDto) {
    return this.prisma.clase.create({
    data: createClassDto,
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

    async update(id: number, updateClassDto: UpdateClassDto) {
    return this.prisma.clase.update({
    where: { id_clase: id },
    data: updateClassDto,
    });
    }

    async remove(id: number) {
    return this.prisma.clase.delete({
    where: { id_clase: id },
    });
    }
}


