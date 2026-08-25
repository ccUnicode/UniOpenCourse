import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class LoginDto {
  @IsString({ message: 'El correo o nombre de usuario debe ser un texto' })
  @IsNotEmpty({ message: 'El correo electrónico o nombre de usuario es obligatorio' })
  @MaxLength(75, {
    message: 'El correo o nombre de usuario no puede tener más de 75 caracteres',
  })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MaxLength(255, {
    message: 'La contraseña no puede tener más de 255 caracteres',
  })
  password: string;
}
