// 1. Herramienta para generar tipos parciales (opcionales)
import { PartialType } from '@nestjs/mapped-types';
// 2. Molde base de creación
import { CreateClassDto } from './create-class.dto';

/**
 * DTO: ACTUALIZACIÓN DE CLASES
 * Hereda las validaciones de CreateClassDto pero las marca como opcionales.
 * Permite realizar actualizaciones parciales (PATCH) sin enviar todo el objeto.
 */
export class UpdateClassDto extends PartialType(CreateClassDto) {}
