import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO: CREACIÓN DE ARCHIVO FÍSICO
 */
export class CreateFileDto {
  /**
   * ID de la Clase Relacionada
   * - @Type(() => Number): Convierte el valor de texto a número (obligatorio en envíos de archivos binarios).
   * - @IsInt: Garantiza un formato numérico entero para la relación en base de datos.
   */
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  class_id: number;
}
