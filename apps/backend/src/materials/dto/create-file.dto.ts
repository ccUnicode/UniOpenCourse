import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/** DTO for uploading a physical file */
export class CreateFileDto {

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  class_id: number;
}
