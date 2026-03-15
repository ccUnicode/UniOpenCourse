import { Injectable } from '@nestjs/common';
import {PrismaService} from '../../prisma.service';
import {CreateClassDto} from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
@Injectable()
export class ClassesService {
    constructor (private prisma: PrismaService) {};
    async create(createClassDto: CreateClassDto) {
    return this.prisma.class.create({
    data: createClassDto,
    });
    }

    async findAll() {
    return this.prisma.class.findMany();
    }

    async findOne(id: number) {
    return this.prisma.class.findUnique({
    where: { class_id: id },
    });
    }

    async update(id: number, updateClassDto: UpdateClassDto) {
    return this.prisma.class.update({
    where: { class_id: id },
    data: updateClassDto,
    });
    }

    async remove(id: number) {
    return this.prisma.class.delete({
    where: { class_id: id },
    });
    }
}


