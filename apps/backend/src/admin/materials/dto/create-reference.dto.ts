import { IsString, IsNotEmpty, IsInt } from 'class-validator';

/**
 * DTO: CREACIÓN DE REFERENCIA LITERARIA
 */
export class CreateReferenceDto {
  /**
   * - class_id: ID entero para vinculación con la Clase.
   */
  @IsInt()
  @IsNotEmpty()
  class_id: number;

  /**
   * - filename: Título o nombre visual de la referencia.
   */
  @IsString()
  @IsNotEmpty()
  filename: string;

  /**
   * - written_reference: Contenido literario o cita bibliográfica.
   */
  @IsString()
  @IsNotEmpty()
  written_reference: string;
}
