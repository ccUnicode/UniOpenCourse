import { IsString, IsNotEmpty, IsInt, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/** DTO for creating a text reference */
export class CreateReferenceDto {
  @Type(() => Number)
  @IsInt({ message: 'El ID de la clase debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la clase es obligatorio' })
  class_id: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del material es obligatorio' })
  @MaxLength(150, {
    message: 'El nombre del material no puede exceder los 150 caracteres',
  })
  filename: string;

  @IsString()
  @IsNotEmpty({ message: 'La referencia es obligatoria' })
  @MaxLength(1000, {
    message: 'La referencia no puede exceder los 1000 caracteres',
  })
  written_reference: string;
}
