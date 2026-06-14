import { IsString, IsNotEmpty, IsInt, IsUrl } from 'class-validator';

export class CreateLinkDto {
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
