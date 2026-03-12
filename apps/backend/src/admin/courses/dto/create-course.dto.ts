import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del curso es obligatorio' })
  @MinLength(5, { message: 'El nombre del curso debe tener al menos 5 caracteres' })
  @MaxLength(100, { message: 'El nombre del curso no puede exceder los 100 caracteres' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El código del curso es obligatorio' })
  @MaxLength(10, { message: 'El código del curso no puede exceder los 10 caracteres' })
  codigo_curso: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción del curso es obligatoria' })
  descripcion: string;

  @IsUrl({}, { message: 'La URL de la imagen debe ser una URL válida' })
  @IsOptional()
  url_imagen?: string;

  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @IsOptional()
  id_docente?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'El nombre del docente no puede exceder los 50 caracteres' })
  nombre_docente?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, {
    message: 'El apellido del docente no puede exceder los 50 caracteres',
  })
  apellido_docente?: string;
}
