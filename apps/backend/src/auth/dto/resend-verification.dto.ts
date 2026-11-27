import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class ResendVerificationDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @MaxLength(75, {
    message: 'El correo electrónico no puede tener más de 75 caracteres',
  })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;
}
