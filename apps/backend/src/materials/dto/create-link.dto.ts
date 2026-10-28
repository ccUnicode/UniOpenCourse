import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/** DTO for creating an external link */
export class CreateLinkDto {
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
  @IsNotEmpty({ message: 'El enlace del material es obligatorio' })
  @MaxLength(500, {
    message: 'El enlace del material no puede exceder los 500 caracteres',
  })
  @IsUrl(
    { require_protocol: true, protocols: ['https'] },
    { message: 'El enlace debe ser una URL HTTPS válida' },
  )
  url_link: string;
}
