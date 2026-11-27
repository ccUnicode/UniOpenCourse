import { IsNotEmpty, IsInt, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/** DTO for uploading a physical file */
export class CreateFileDto {
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
}
