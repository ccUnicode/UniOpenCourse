import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * OBJETO DE TRANSFERENCIA DE DATOS (CREATE FILE DTO)
 * Funciona como una barrera de seguridad diseñada exclusivamente para la subida de Archivos Físicos.
 * Audita rigurosamente los metadatos ocultos que viajan acompañando al archivo binario principal.
 */
export class CreateFileDto {
  /**
   * Identificador Relacional (Llave Foránea de la Clase)
   * 
   * 1. `@IsNotEmpty()`: Obliga a que el usuario siempre indique a qué clase se amarrará este archivo.
   * 2. `@Type(() => Number)`: [MECANISMO CRÍTICO] Cuando enviamos un archivo físico pesado (como un documento PDF) por internet, 
   *    los navegadores usan una regla especial de envío que trata "todo" el paquete como si fuera texto plano para protegerlo.
   *    Si el usuario manda un ID con el número 5 junto con el PDF, el sistema lo empaquetará forzosamente como texto (ej: "5"). 
   *    Este decorador actúa como traductor: atrapa el texto "5" apenas toca nuestro servidor y lo transforma de nuevo a un 
   *    Número Matemático puro para evitar que nuestra Base de Datos rebote la petición por error de tipos.
   * 3. `@IsInt()`: Ya transmutado, esta regla exige que el dato sea estrictamente un Número Entero (y no un 5.1), 
   *    asegurando un encaje perfecto contra el Schema rígido de Prisma.
   */
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  class_id: number;
}
