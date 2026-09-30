import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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
  constructor(private readonly authService: AuthService) {}

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
}
