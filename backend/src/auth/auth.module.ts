import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { PasswordResetService } from './password-reset.service';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    PasswordResetService,
    RedisService,
    EmailService,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    PasswordResetService,
    RedisService,
  ],
})
export class AuthModule {}