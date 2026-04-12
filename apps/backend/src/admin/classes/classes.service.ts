// 1. Herramientas técnicas y modelos
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

// 2. Parámetros de configuración local
const PAGE_SIZE = 12;

/**
 * SERVICIO ADMINISTRATIVO DE CLASES
 */
@Injectable()
export class ClassesService {
    constructor(private prisma: PrismaService) {}

    /**
     * Registro de Clases
     * - Prisma 'data': Mapea automáticamente el DTO a las columnas de la tabla 'class'.
     */
    async create(createClassDto: CreateClassDto) {
        return this.prisma.class.create({
            data: createClassDto,
        });
    }

    /**
     * Listado General con Paginación y Búsqueda
     */
    async findAll(search?: string, page: number = 1) {
        
        // Offset: Calcula cuántos registros ignorar según la página actual.
        const skip = (page - 1) * PAGE_SIZE;

        // Filtro condicional: Si 'search' existe, busca coincidencias parciales (insensibles a mayúsculas).
        const where = search
            ? {
                title: {
                contains: search,
                mode: 'insensitive' as const,
                },
            }
            : {};

        // Transacción paralela: Ejecuta la búsqueda y el conteo total simultáneamente.
        // [data, total]: Desestructura el arreglo de respuestas de Prisma.
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
            totalPages: Math.ceil(total / PAGE_SIZE), // Redondeo al techo para el total de páginas.
        };
    }

    /**
     * Búsqueda por Identificador
     */
    async findOne(id: number) {
        return this.prisma.class.findUnique({
            where: { class_id: id },
        });
    }

    /**
     * Actualización Parcial (PATCH)
     */
    async update(id: number, updateClassDto: UpdateClassDto) {
        return this.prisma.class.update({
            where: { class_id: id },
            data: updateClassDto,
        });
    }

    /**
     * Eliminación de Registro
     */
    async remove(id: number) {
        return this.prisma.class.delete({
            where: { class_id: id },
        });
    }
}
