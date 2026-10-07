import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'E-mail do usuário',
  })
  @IsEmail()
  email!: string;
}