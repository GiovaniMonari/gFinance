import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * The identity the profile screen renders. Deliberately narrow: the screen
 * needs who the signed-in user is, not what the account holds — the password
 * column and every timestamp stay behind.
 */
export type UserProfile = {
  id: string;
  email: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The user id arrives already verified from the JWT strategy, never from a
   * query, body or param, so there is no path here to someone else's profile.
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    // Unreachable while the strategy keeps validating against the same table,
    // but a token outliving its user must answer a status, not a null body.
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }
}
