import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del curso es obligatorio' })
  @MinLength(5, { message: 'El nombre del curso debe tener al menos 5 caracteres' })
  @MaxLength(100, { message: 'El nombre del curso no puede exceder los 100 caracteres' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El código del curso es obligatorio' })
  @MaxLength(10, { message: 'El código del curso no puede exceder los 10 caracteres' })
  course_code: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción del curso es obligatoria' })
  description: string;

  @Type(() => Number)
  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @IsOptional()
  teacher_id?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'El nombre del docente no puede exceder los 50 caracteres' })
  teacher_name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, {
    message: 'El apellido del docente no puede exceder los 50 caracteres',
  })
  teacher_last_name?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @MaxLength(255, { message: 'La URL no puede exceder los 255 caracteres' })
  @Matches(/^https:\/\/trikaweb\.ccunicode\.org\//, {
    message: 'La URL debe ser segura (HTTPS) y pertenecer a trikaweb.ccunicode.org',
  })
  url_trikaweb?: string;
}
