import { Injectable, NotFoundException } from '@nestjs/common';
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

    /**
     * Retrieves paginated classes, optionally filtered by title
     * @param search - Optional search term to filter classes
     * @param page - The current page number for pagination (defaults to 1)
     * @returns A paginated object containing the data and metadata
     */
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
        const classItem = await this.prisma.class.findUnique({
            where: { class_id: id },
        });

        if (!classItem) {
            throw new NotFoundException('Clase no encontrada');
        }

        return classItem;
    }

    /** Partially updates a class */
    async update(id: number, updateClassDto: UpdateClassDto) {
        await this.findOne(id);
        return this.prisma.class.update({
            where: { class_id: id },
            data: updateClassDto,
        });
    }

    /** Deletes a class */
    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.class.delete({
            where: { class_id: id },
        });
    }
}
