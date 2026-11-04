import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

const YOUTUBE_PARAM = '[\\w.~%+=-]*';
const YOUTUBE_WATCH_OR_SHARE_LINK = new RegExp(
  `^https:\\/\\/(?:(?:www|m)\\.)?youtube\\.com\\/watch\\?(?:${YOUTUBE_PARAM}=${YOUTUBE_PARAM}&)*v=[\\w-]{11}(?:&${YOUTUBE_PARAM}=${YOUTUBE_PARAM})*$` +
    `|^https:\\/\\/youtu\\.be\\/[\\w-]{11}(?:\\?${YOUTUBE_PARAM}(?:&${YOUTUBE_PARAM}=${YOUTUBE_PARAM})*)?$`,
);

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
  @Transform(({ value }: { value: unknown }): unknown => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
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
