import { IsString, IsNotEmpty, IsInt } from 'class-validator';

/**
 * OBJETO DE TRANSFERENCIA DE DATOS (CREATE REFERENCE DTO)
 * Barrera de seguridad para el material de tipo "Referencia Escrita" (citas de libros, anotaciones largas).
 * Asegura que el formato del contenido literario venga tipado correctamente antes de guardarse en la DB.
 */
export class CreateReferenceDto {
  /**
   * Identificador Relacional (Llave Foránea de la Clase)
   * - `@IsInt()` y `@IsNotEmpty()`: Asegura el anclaje riguroso obligando la llegada del ID de la clase padre.
   */
  @IsInt()
  @IsNotEmpty()
  class_id: number;

  /**
   * Nombre Visual de la Referencia Literaria (Ej: "Libro de Cálculo - Capítulo 2")
   */
  @IsString()
  @IsNotEmpty()
  filename: string;

  /**
   * Cuerpo Literario Orgánico
   * - `@IsString()`: Asegura que la descripción larga o la cita bibliográfica sea enviada como Texto puro.
   */
  @IsString()
  @IsNotEmpty()
  written_reference: string;
}
