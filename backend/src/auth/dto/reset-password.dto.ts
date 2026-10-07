import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'token-gerado-no-email',
    description: 'Token de redefinição de senha',
  })
  @IsString()
  token!: string;

  @ApiProperty({
    example: 'nova-senha123',
    description: 'Nova senha do usuário',
  })
  @IsString()
  @MinLength(6, {
    message: 'A senha deve ter pelo menos 6 caracteres.',
  })
  newPassword!: string;

  @ApiProperty({
    example: 'nova-senha123',
    description: 'Confirmação da nova senha do usuário',
  })
  @IsString()
  @MinLength(6, {
    message: 'A senha deve ter pelo menos 6 caracteres.',
  })
  confirmPassword!: string;
}