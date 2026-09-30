import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Registration carries its own password rule; login deliberately does not.
 *
 * Sharing one DTO between the two would apply the minimum length to the sign-in
 * as well, and a person whose password predates the rule would be locked out by
 * a form they are only trying to sign in with. The minimum here is six because
 * that is exactly what the app already enforces before it sends anything — a
 * stricter server rule than the client would surface as a failure the person
 * cannot explain.
 */
export class RegisterDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'E-mail do usuário',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário',
  })
  @IsString()
  @MinLength(6, {
    message: 'A senha deve ter pelo menos 6 caracteres.',
  })
  password!: string;
}
