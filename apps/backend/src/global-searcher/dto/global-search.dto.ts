import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchDto {
  @Transform(({ value }): string | undefined => {
    if (typeof value !== 'string') {
      return undefined;
    }
    return value.trim().toLowerCase();
  })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  q!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  page?: number = 1;
}
