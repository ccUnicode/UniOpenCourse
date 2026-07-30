import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @MaxLength(75, {
    message: 'El correo electrónico no puede tener más de 75 caracteres',
  })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MaxLength(255, {
    message: 'La contraseña no puede tener más de 255 caracteres',
  })
  password: string;
}
