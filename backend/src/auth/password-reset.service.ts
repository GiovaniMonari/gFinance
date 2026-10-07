import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';

import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { TOKEN_TTL } from 'src/auth/constants/token.ttl';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return;
    }

    const token = randomBytes(32).toString('hex');

    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    await this.redis.set(
      `password-reset:${tokenHash}`,
      user.id,
      TOKEN_TTL.PASSWORD_RESET,
    );

    await this.emailService.sendResetPasswordEmail(
      email,
      token,
    );
  }

  async tokenIsValid(token: string): Promise<boolean> {
    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const userId = await this.redis.get(
      `password-reset:${tokenHash}`,
    );

    return !!userId;
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const userId = await this.redis.get(
      `password-reset:${tokenHash}`,
    );

    if (!userId) {
      throw new BadRequestException(
        'Token inválido ou expirado',
      );
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      12,
    );

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: passwordHash,
      },
    });

    await this.redis.del(
      `password-reset:${tokenHash}`,
    );
  }
}