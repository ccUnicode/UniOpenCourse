import { IsString, IsNotEmpty, IsInt, IsUrl, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/** DTO for creating a new class */
export class CreateClassDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  course_id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsUrl()
  url_youtube: string;
}
