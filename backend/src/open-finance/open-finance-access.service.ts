import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  canConnect,
  isOpenFinanceReleased,
  isOpenFinanceTestAccount,
} from './open-finance-access';

/** What `GET /open-finance/status` answers. */
export type OpenFinanceAvailability = {
  available: boolean;
};

/**
 * Resolves the access question for one signed-in account.
 *
 * `canConnect` in `open-finance-access.ts` owns the rule; this class only
 * reads the user's email and hands it over. The endpoint that tells the
 * screen what to render and the guard that enforces it call the same method,
 * so they can never disagree.
 *
 * While the feature is closed for app users, no downstream call is made:
 * a blocked account is answered from the switch and the exempt list alone,
 * so an outage in the Open Finance service cannot open the flow.
 */
@Injectable()
export class OpenFinanceAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async canConnect(userId: string): Promise<boolean> {
    /*
     * The switch needs nothing from the database, so it is asked first:
     * releasing the feature costs no queries at all.
     */
    if (isOpenFinanceReleased()) return true;

    const email = await this.emailOf(userId);

    if (isOpenFinanceTestAccount(email)) return true;

    return canConnect({ email });
  }

  /** What the app asks before it decides whether to offer the flow. */
  async getAvailability(userId: string): Promise<OpenFinanceAvailability> {
    return { available: await this.canConnect(userId) };
  }

  private async emailOf(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    return user?.email ?? null;
  }
}
