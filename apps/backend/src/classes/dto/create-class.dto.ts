import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

const YOUTUBE_WATCH_OR_SHARE_LINK =
  /^https:\/\/(?:(?:www|m)\.)?youtube\.com\/watch\?v=[\w-]{11}(?:&[\w.\-=%]*)*$|^https:\/\/youtu\.be\/[\w-]{11}(?:\?[\w.\-=%]*)?$/;

/** DTO for creating a new class */
export class CreateClassDto {
  @Type(() => Number)
  @IsInt({ message: 'El ID del curso debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del curso es obligatorio' })
  course_id: number;

  @IsString()
  @IsNotEmpty({ message: 'El título de la clase es obligatorio' })
  @MaxLength(150, {
    message: 'El título de la clase no puede exceder los 150 caracteres',
  })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción de la clase es obligatoria' })
  @MaxLength(500, {
    message: 'La descripción de la clase no puede exceder los 500 caracteres',
  })
  description: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value == null) return undefined;
    if (typeof value !== 'string') return value;
    return value.trim();
  })
  @IsString()
  @MaxLength(150, {
    message: 'El enlace de YouTube no puede exceder los 150 caracteres',
  })
  @Matches(YOUTUBE_WATCH_OR_SHARE_LINK, {
    message:
      'El enlace debe ser un video de YouTube válido (youtube.com/watch o youtu.be)',
  })
  url_youtube?: string;
}
