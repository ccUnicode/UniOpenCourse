import { IsString, IsNotEmpty, IsInt } from 'class-validator';

/** DTO for creating a text reference */
export class CreateReferenceDto {

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
