import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateFileDto {
  @IsInt()
  @IsNotEmpty()
  class_id: number;

  @IsString()
  @IsNotEmpty()
  filename: string;
}
