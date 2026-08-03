import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @MaxLength(75, {
    message: 'El correo electrónico no puede tener más de 75 caracteres',
  })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(50, {
    message: 'El nombre no puede tener más de 50 caracteres',
  })
  name: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(50, {
    message: 'El apellido no puede tener más de 50 caracteres',
  })
  last_name: string;

  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @MaxLength(70, {
    message: 'El nombre de usuario no puede tener más de 70 caracteres',
  })
  username: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MaxLength(255, {
    message: 'La contraseña no puede tener más de 255 caracteres',
  })
  password: string;
}
