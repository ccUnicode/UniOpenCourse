import { IsOptional, IsString, IsInt, Min, Max, MaxLength } from 'class-validator';
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
  @Max(1000)
  page?: number = 1;
}
