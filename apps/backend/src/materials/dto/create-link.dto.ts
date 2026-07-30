import { IsString, IsNotEmpty, IsInt, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

/** DTO for creating an external link */
export class CreateLinkDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  class_id: number;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsUrl()
  @IsNotEmpty()
  url_link: string;
}
