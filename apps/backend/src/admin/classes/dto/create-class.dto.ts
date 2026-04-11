// 1. IMPORTACIÓN DE DECORADORES DE EVALUACIÓN
// `class-validator` es una librería que nos ayuda a validar la información.
// Nos permite ponerle reglas a las variables que los usuarios envían por internet.
import { IsString, IsNotEmpty, IsInt, IsUrl } from 'class-validator';

/**
 * OBJETO DE TRANSFERENCIA DE DATOS (CREATE DTO)
 * Funciona como una barrera de seguridad para el Controlador.
 * Actúa como un "Molde" estricto. Cualquier petición de internet (JSON) que intente 
 * crear una Clase nueva será bloqueada automáticamente por NestJS si no respeta 
 * los tipos de datos exactos y las reglas obligatorias exigidas aquí.
 * 
 * NOTA ARQUITECTÓNICA: 
 * Aquí NO se exige enviar el 'class_id' propio de la nueva clase. Esto se debe a que
 * en el archivo 'schema.prisma' se definió que la base de datos auto-genera ese ID automáticamente (autoincrement).
 */
export class CreateClassDto {
  
  /**
   * Identificador Relacional (Llave Foránea del Curso)
   * - `@IsInt()`: Exige que el dato recibido sea estrictamente un Número Entero (para coincidir con el Schema SQL).
   * - `@IsNotEmpty()`: Obliga a que el usuario siempre envíe este campo. Si llega vacío o nulo, la petición falla con error 400.
   */
  @IsInt()
  @IsNotEmpty() 
  course_id: number;

  /**
   * Título y Descripción de la Clase principal
   * - `@IsString()`: Verifica que la información ingresada en estos campos sea texto convencional y no números ni arreglos sueltos.
   */
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  /**
   * Enlace de Video Externo
   * - `@IsUrl()`: Verifica inteligentemente que el texto guarde la estructura visual de un enlace válido 
   *   (por ejemplo, que empiece con http:// o https://). Si el usuario envía texto común, dará error automático.
   */
  @IsUrl()
  @IsNotEmpty()
  url_youtube: string;
}
