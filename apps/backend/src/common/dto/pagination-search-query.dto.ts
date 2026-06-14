import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from './pagination-query.dto';

export class PaginationSearchQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}
