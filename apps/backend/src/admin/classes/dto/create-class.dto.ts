import { IsString, IsNotEmpty, IsInt, IsUrl } from 'class-validator';

export class CreateClassDto {
  @IsInt()
  @IsNotEmpty() 
  course_id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsNotEmpty()
  url_youtube: string;
}
