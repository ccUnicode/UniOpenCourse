// 1. Validadores de tipo y presencia
import { IsString, IsNotEmpty, IsInt, IsUrl, IsOptional } from 'class-validator';

/**
 * DTO: CREACIÓN DE CLASES
 * Define los requisitos mínimos para registrar una nueva lección.
 */
export class CreateClassDto {
  /**
   * - course_id: ID entero obligatorio para vincular la clase a un curso.
   */
  @IsInt()
  @IsNotEmpty() 
  course_id: number;

  /**
   * - title: Título visual de la clase.
   */
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
   * - description: Resumen o contenido detallado de la lección.
   */
  @IsString()
  @IsNotEmpty()
  description: string;

  /**
   * - url_youtube: Dirección URL válida del video (HTTP/HTTPS). Opcional.
   */
  @IsOptional()
  @IsUrl()
  url_youtube?: string;
}
