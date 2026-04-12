// 1. HERRAMIENTAS DE NESTJS Y EXCEPCIONES
// `BadRequestException`: Se utiliza para devolver un error 400 claro al usuario si algo sale mal (ej: falta el archivo).
import { Injectable, BadRequestException } from '@nestjs/common';
// 2. CONEXIÓN A BASE DE DATOS
import { PrismaService } from '../../prisma.service';
// 3. MOLDES DE SEGURIDAD (DTOs)
import { CreateFileDto } from './dto/create-file.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { CreateReferenceDto } from './dto/create-reference.dto';

/**
 * SERVICIO DE ADMINISTRACIÓN DE MATERIALES
 * 
 * 1. `@Injectable()`: Es un sello de calidad de NestJS. Le avisa al sistema que esta clase 
 *    puede ser "inyectada" (prestada) a cualquier Controlador que la necesite.
 * 
 * 2. Inyección de Dependencias: En lugar de crear un objeto Prisma manualmente dentro de cada 
 *    función, NestJS lo crea una sola vez y nos lo entrega listo para usar en el constructor.
 */
@Injectable()
export class MaterialsService {
  /**
   * CONSTRUCTOR Y MODIFICADORES DE ACCESO
   * Al escribir `private prisma: PrismaService`, TypeScript hace tres cosas automáticas:
   * A. Crea una variable interna en la clase.
   * B. Recibe la conexión a la base de Datos que le manda NestJS.
   * C. Asigna esa conexión a `this.prisma` para que podamos usarla en todo el archivo.
   * El uso de `private` protege la conexión para que nadie fuera de esta clase pueda manipularla.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * --- CREACIÓN DE MATERIAL TIPO ARCHIVO FÍSICO ---
   * 
   * @param createFileDto - El ID de la clase que recibimos del JSON.
   * @param file - La información del archivo binario que ya guardó el Interceptor.
   * [SINTAXIS Express.Multer.File]: Es una "Interfaz" (un molde) que le dice a TypeScript 
   * exactamente qué datos trae el archivo (su tamaño, su nombre real, su extensión, etc.). 
   * Sin este molde, no podríamos usar 'file.filename' porque el sistema no sabría qué es.
   */
  async createFile(createFileDto: CreateFileDto, file: Express.Multer.File) {
    // A. VALIDACIÓN DE SEGURIDAD: 
    // Si por algún error el interceptor no logró atrapar el archivo, detenemos todo aquí
    // y lanzamos una excepción clara para que el sistema no intente guardar datos vacíos.
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo válido.');
    }

    // B. REGISTRO EN BASE DE DATOS:
    // Aunque el PDF se guardó en la carpeta física, necesitamos dejar rastro en SQL.
    return this.prisma.material.create({
      data: {
        class_id: createFileDto.class_id,
        material_type: 'file',       // Marcamos el tipo para que el Frontend sepa pintar un icono de PDF.
        filename: file.originalname, // Guardamos el nombre "Bonito" (ej: mi_tarea.pdf).
        url_link: file.filename,     // Guardamos el nombre "Real/Único" (ej: mi_tarea-1234.pdf) para poder encontrarlo luego.
      },
    });
  }

  /**
   * --- CREACIÓN DE MATERIAL TIPO ENLACE (LINK) ---
   */
  async createLink(createLinkDto: CreateLinkDto) {
    return this.prisma.material.create({
      data: {
        // Operador Spread (...): "Esparcimos" todas las variables del DTO (class_id, filename, url_link)
        // para no tener que escribirlas una por una, ahorrando líneas de código.
        ...createLinkDto,
        material_type: 'link', // Forzamos el tipo Link para identificarlo en la tabla.
      },
    });
  }

  /**
   * --- CREACIÓN DE MATERIAL TIPO REFERENCIA (TEXTO) ---
   */
  async createReference(createReferenceDto: CreateReferenceDto) {
    return this.prisma.material.create({
      data: {
        ...createReferenceDto,
        material_type: 'reference', // Marcamos como Referencia para identificarlo en la tabla.
      },
    });
  }

  /**
   * --- ELIMINACIÓN DE REGISTRO ---
   * @param id - El ID único del material que el controlador ya convirtió a Número Matemático.
   */
  async remove(id: number) {
    return this.prisma.material.delete({
      where: { material_id: id },
    });
  }
}
