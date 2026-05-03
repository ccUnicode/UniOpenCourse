import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

const PAGE_SIZE = 12;

@Injectable()
export class ClassesService {
    constructor(private prisma: PrismaService) {}

    /** Creates a new class */
    async create(createClassDto: CreateClassDto) {
        return this.prisma.class.create({
            data: createClassDto,
        });
    }

    /** Retrieves paginated classes, optionally filtered by title */
    async findAll(search?: string, page: number = 1) {
        const skip = (page - 1) * PAGE_SIZE;

        const where = search
            ? {
                title: {
                contains: search,
                mode: 'insensitive' as const,
                },
            }
            : {};

        const [data, total] = await this.prisma.$transaction([
            this.prisma.class.findMany({
                where,
                skip,
                take: PAGE_SIZE,
                orderBy: { class_creation_date: 'desc' },
            }),
            this.prisma.class.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / PAGE_SIZE),
        };
    }

    /** Finds a class by ID */
    async findOne(id: number) {
        return this.prisma.class.findUnique({
            where: { class_id: id },
        });
    }

    /** Partially updates a class */
    async update(id: number, updateClassDto: UpdateClassDto) {
        return this.prisma.class.update({
            where: { class_id: id },
            data: updateClassDto,
        });
    }

    /** Deletes a class */
    async remove(id: number) {
        return this.prisma.class.delete({
            where: { class_id: id },
        });
    }
}
