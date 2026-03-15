import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

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

  @IsUrl({}, { message: 'La URL de la imagen debe ser una URL válida' })
  @IsOptional()
  url_image?: string;

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
}
