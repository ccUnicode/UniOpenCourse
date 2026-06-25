import { IsString, IsNotEmpty, IsInt } from 'class-validator';

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
