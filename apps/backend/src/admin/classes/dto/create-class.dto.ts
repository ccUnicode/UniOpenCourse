import { IsString, IsNotEmpty, IsInt, IsUrl } from 'class-validator';

export class CreateClassDto {
  @IsInt()
  @IsNotEmpty() 
  id_curso: number;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsUrl()
  @IsNotEmpty()
  url_youtube: string;
}
