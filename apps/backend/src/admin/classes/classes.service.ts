// 1. IMPORTACIONES CENTRALES
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

// 2. CONSTANTE GLOBAL DE PAGINACIÓN
// Límite estricto de elementos por página. Puesto fuera de la clase para servir como 
// regla inmutable que ahorre memoria RAM.
const PAGE_SIZE = 12;

/**
 * SERVICIO CENTRAL DE ADMINISTRACIÓN DE CLASES
 * `@Injectable()`: Al igual que los demás servicios, este decorador autoriza a NestJS 
 * inyectar el módulo de BD en cualquier controlador que lo exija en su constructor.
 */
@Injectable()
export class ClassesService {
    constructor(private prisma: PrismaService) {}

    /**
     * CREACIÓN DE REGISTROS
     * 
     * Sobre las palabras reservadas de Prisma en esta función:
     * 
     * 1. La palabra clave `data`: 
     *    No es una columna de la base de datos. Es una llave nativa de Prisma que sirve como "empaque". 
     *    Le indica al servidor que asigne íntegramente todo el Body de red (el `CreateClassDto` ya moldeado) 
     *    dentro de la operación. Prisma desempacará el JSON solo y acomodará los valores en las columnas correspondientes.
     * 
     * 2. Ausencia de la propiedad `where`:
     *    A diferencia de operaciones como las de actualización o eliminación, el registro que se está 
     *    pasando aquí no existe en la base de datos, por lo que no es necesario indicar un 
     *    "ancla de búsqueda" (`where`). `.create()` genera espontáneamente una nueva fila al final del registro.
     */
    async create(createClassDto: CreateClassDto) {
        return this.prisma.class.create({
            data: createClassDto,
        });
    }

    /**
     * BÚSQUEDA GENERAL PAGINADA (El motor principal de Extracción)
     * Desglosado algorítmicamente en comentarios internos.
     */
    async findAll(search?: string, page: number = 1) {
        
        // 1. CÁLCULO DE SALTO MATEMÁTICO (Offset):
        // Fórmula matemática para saber cuántas filas ignorar al paginar. 
        // Si el usuario pide página 1: (1 - 1) * 12 = Salta 0. 
        // Si pide la página 3: (3 - 1) * 12 = Salta 24 filas iniciales.
        const skip = (page - 1) * PAGE_SIZE;

        // 2. CONSTRUCCIÓN DEL DICCIONARIO DE FILTRO (Sintaxis Ternaria `? :`):
        // Esta línea es un condicional puro. Significa lo siguiente a nivel de sintaxis: 
        // Si la variable `search` trae un valor String verdadero... `where` adoptará el valor 
        // de un diccionario entero, donde se exige buscar el `title` cruzando los datos para ver si "contiene" (`contains`)
        // el texto de search, obligándolo a que sea modo 'insensitivo' (que ignore las mayúsculas).
        // Pero, si `search` llega vacío (entramos en los `:`)... `where` adoptará el valor final de unas simples llaves vacías `{}`,
        // lo cual avisa al sistema que no hay filtro y debe jalar el esquema completo.
        const where = search
            ? {
                title: {
                contains: search,
                mode: 'insensitive' as const,
                },
            }
            : {};

        // 3. TRANSACCIÓN Y SINTAXIS DE CORCHETES (`const [data, total] =`):
        // Prisma.$transaction([ ... ]) ejecutará las búsquedas y escupirá como retorno un Arreglo gigante `[ ]` con dos respuestas.
        // La sintaxis de los corchetes en las constantes (`const [A, B] =`) se utiliza para evitar escribir manualmente cosas como "total = respuesta[1]".
        // Crea dos canastas al vuelo usando el orden numérico de llegada:
        // - La canasta `data` absorberá obligatoriamente lo devuelto por la primera orden de Prisma (la lista de clases de `.findMany`).
        // - La canasta `total` absorberá obligatoriamente lo devuelto por la segunda orden (el conteo numérico de `.count()`).
        const [data, total] = await this.prisma.$transaction([
            this.prisma.class.findMany({
                where,
                skip,
                take: PAGE_SIZE,
                orderBy: { class_creation_date: 'desc' },
            }),
            this.prisma.class.count({ where }),
        ]);

        // 4. RETORNO DEL PAQUETE AL FRONTEND:
        // Empaqueta todas las variables. Para calcular `totalPages`, divide universalmente (ej: 13 filas / 12 límite = 1.08).
        // `Math.ceil()` captura ese decimal y lo empuja forzando el redondeo a su techo absoluto (2).
        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / PAGE_SIZE),
        };
    }

    /**
     * LECTURA DE PUNTO FIJO
     * Delega el Id numérico extraído hacia la función `findUnique` para traer la fila exacta en BD.
     */
    async findOne(id: number) {
        return this.prisma.class.findUnique({
            where: { class_id: id },
        });
    }

    /**
     * ACTUALIZACIÓN PARCIAL O TOTAL (PATCH)
     * Utiliza la clave primaria (`where: class_id`) para anclar la fila SQL,
     * y vierte la transmutación de datos (`updateClassDto`). Cambiará únicamente
     * aquellas variables que hayan sido declaradas o llenadas en el paquete web opcional.
     */
    async update(id: number, updateClassDto: UpdateClassDto) {
        return this.prisma.class.update({
            where: { class_id: id },
            data: updateClassDto,
        });
    }

    /**
     * ELIMINACIÓN FÍSICA Y CASCADE
     * Localiza la fila nativa mediante la inyección del Id e instruye a Prisma borrarla del esquema permanentemente.
     */
    async remove(id: number) {
        return this.prisma.class.delete({
            where: { class_id: id },
        });
    }
}
