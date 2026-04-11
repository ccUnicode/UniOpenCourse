// 1. IMPORTACIÓN DE HERRAMIENTA DE HERENCIA MÚLTIPLE
// `PartialType` es una herramienta avanzada de NestJS orientada a la arquitectura limpia y a 
// la no repetición de código (Principio DRY - Don't Repeat Yourself).
import { PartialType } from '@nestjs/mapped-types';

// 2. IMPORTACIÓN DEL MOLDE BASE
// Importación del molde originario el cual posee todas las exigencias obligatorias y estrictas requeridas.
import { CreateClassDto } from './create-class.dto';

/**
 * OBJETO DE TRANSFERENCIA DE DATOS (UPDATE DTO)
 * A simple vista parece vacío, pero al estructurarse hereda íntegramente las validaciones de seguridad de CreateClassDto.
 * 
 * Mecánica de Transmutación (`PartialType`):
 * Al extender la clase usando `PartialType(CreateClassDto)`, el motor de NestJS clona matemáticamente
 * todo el contenido del molde padre. Sin embargo, en el instante de clonación, transforma internamente
 * todas las exigencias rígidas (`@IsNotEmpty`) en exigencias optativas automáticas (`@IsOptional`).
 * 
 * Finalidad Arquitectónica: 
 * Cuando un usuario intenta editar remotamente un registro (Endpoint PATCH), no está forzado a enviar 
 * la información completa de nuevo (título, descripción, link, etc). Si solo decide actualizar el "Título", 
 * este molde permite que la petición pase válida. Sin embargo, sigue garantizando la seguridad en el Título, 
 * asegurándose que lo que sea que haya enviado siga cumpliendo la regla originaria (`@IsString()`).
 */
export class UpdateClassDto extends PartialType(CreateClassDto) {}
