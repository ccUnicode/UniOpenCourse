import { IsString, IsNotEmpty, IsInt, IsUrl } from 'class-validator';

/**
 * DTO: CREACIÓN DE ENLACE EXTERNO
 */
export class CreateLinkDto {
  /**
   * - class_id: ID entero obligatorio para vincular a la Clase.
   */
  @IsInt()
  @IsNotEmpty()
  class_id: number;

  /**
   * - filename: Nombre descriptivo o título del enlace.
   */
  @IsString()
  @IsNotEmpty()
  filename: string;

  /**
   * - url_link: Dirección web con formato válido (HTTP/HTTPS).
   */
  @IsUrl()
  @IsNotEmpty()
  url_link: string;
}
