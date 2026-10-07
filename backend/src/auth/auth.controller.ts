import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordResetService } from './password-reset.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password';

/**
 * Credential guessing is counted per account, not per address alone.
 *
 * Keying only on the network address has two failure modes behind a proxy:
 * every user can share one address, so a stranger could spend the whole
 * budget and lock everyone out; or, with addresses rotating freely, one
 * account could be hammered without ever touching a limit. The account is the
 * thing being guessed, so the account is part of the key — and the address
 * still contributes, so spraying many accounts from one place stays bounded by
 * the global limit.
 */
function credentialTracker(req: Record<string, unknown>): string {
  const body = req.body as { email?: unknown } | undefined;
  const email =
    typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const ip = typeof req.ip === 'string' ? req.ip : 'unknown';

  return `${ip}|${email}`;
}

@ApiTags('Auth')
@Controller('auth')
@Throttle({
  default: { ttl: 60_000, limit: 10, getTracker: credentialTracker },
})
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Criar uma nova conta' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Realizar login' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
  
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar redefinição de senha' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordResetService.sendPasswordResetEmail(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Redefinir senha' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException(
        'As senhas não coincidem.',
      );
    }

    return this.passwordResetService.resetPassword(
      dto.token,
      dto.newPassword,
    );
  }
}
