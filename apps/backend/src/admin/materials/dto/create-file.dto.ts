import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFileDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  class_id: number;
}
