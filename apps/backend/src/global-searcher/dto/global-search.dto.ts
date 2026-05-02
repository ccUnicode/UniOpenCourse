import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchDto {
  @IsOptional()
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
