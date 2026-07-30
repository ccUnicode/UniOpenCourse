import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/** DTO for creating a text reference */
export class CreateReferenceDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  class_id: number;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  written_reference: string;
}
