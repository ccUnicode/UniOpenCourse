import { IsArray, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsOptional()
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres.' })
  name?: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  description?: string;

  @IsArray({ message: 'Los IDs de cursos deben ser un arreglo.' })
  @IsInt({ each: true, message: 'Cada ID de curso debe ser un número entero.' })
  @IsOptional()
  @Type(() => Number)
  course_ids?: number[];
}
