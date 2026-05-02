import { IsOptional, IsString, IsInt, Min, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchDto {
  @IsOptional()
  @MaxLength(150)
  @IsString()
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return value?.trim().toLowerCase();
  })
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
