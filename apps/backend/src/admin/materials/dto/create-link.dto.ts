import { IsString, IsNotEmpty, IsInt, IsUrl } from 'class-validator';

/**
 * OBJETO DE TRANSFERENCIA DE DATOS (CREATE LINK DTO)
 * Barrera de seguridad especializada en la inserción de Enlaces o URLs Externos.
 * Bloquea cualquier Json que intente inyectar un recurso si no cumple rígidamente 
 * con la tipología requerida.
 */
export class CreateLinkDto {
  /**
   * Identificador Relacional (Llave Foránea de la Clase)
   * - `@IsInt()`: Exige que el dato sea estrictamente un Número Entero nativo.
   * - `@IsNotEmpty()`: Previene la creación de un enlace huérfano, obligando a vincularlo a una Clase.
   */
  @IsInt()
  @IsNotEmpty()
  class_id: number;

  /**
   * Nombre Visual del Enlace (Ej: "Video Explicativo de Física")
   * - `@IsString()`: Verifica que la información ingresada en este título sea texto convencional.
   */
  @IsString()
  @IsNotEmpty()
  filename: string;

  /**
   * Dirección Original del Enlace Web
   * - `@IsUrl()`: Examina inteligentemente el texto asegurándose que posea la anatomía sintáctica de 
   *    un hipervínculo válido (que incluya los sufijos correctos como http:// o https://). Si mandan texto al azar, lanza error 400.
   */
  @IsUrl()
  @IsNotEmpty()
  url_link: string;
}
