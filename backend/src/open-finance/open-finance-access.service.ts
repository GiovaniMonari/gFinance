import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  canConnect,
  isOpenFinanceReleased,
  isOpenFinanceTestAccount,
} from './open-finance-access';
import { OpenFinanceService } from './open-finance.service';

/** What `GET /open-finance/status` answers. */
export type OpenFinanceAvailability = {
  available: boolean;
};

/**
 * Resolves the access question for one signed-in account.
 *
 * `canConnect` in `open-finance-access.ts` owns the rule; this class only
 * gathers the two facts the rule needs — who the user is, and whether they
 * already hold a link — and hands them over. Keeping the lookup here rather
 * than in the guard means the endpoint that tells the screen what to render
 * and the guard that enforces it can never disagree: they are the same
 * method.
 */
@Injectable()
export class OpenFinanceAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openFinanceService: OpenFinanceService,
  ) {}

  async canConnect(userId: string): Promise<boolean> {
    /*
     * The switch needs nothing from the database, so it is asked first:
     * releasing the feature costs no queries at all. The exempt list is taken
     * next, before the Open Finance service is asked for the user's links, so
     * testing never waits on somebody else's bank.
     */
    if (isOpenFinanceReleased()) return true;

    const email = await this.emailOf(userId);

    if (isOpenFinanceTestAccount(email)) return true;

    return canConnect({
      email,
      hasConnection: await this.hasActiveConnection(userId),
    });
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

  /**
   * Whether the user still holds a link the app has not revoked.
   *
   * Read from the Open Finance service rather than from a local table: that
   * service owns connection records, and a second copy here would be a second,
   * eventually disagreeing, source of truth.
   *
   * An outage answers `true` on purpose. Failing closed would lock every
   * already-connected account out of a feature they are still meant to have,
   * and a caller who genuinely has no link gets no further than the very next
   * call, which reaches the same service and fails there.
   */
  private async hasActiveConnection(userId: string): Promise<boolean> {
    try {
      // The proxy answers `any`, so the shape it is read as is stated here
      // rather than carried into the check below.
      const data = (await this.openFinanceService.getConnections(userId)) as
        Record<string, unknown> | null | undefined;

      const connections: unknown = data?.connections;

      if (!Array.isArray(connections)) return false;

      return connections.some(
        (connection: unknown) =>
          (connection as { status?: string } | null)?.status !== 'disconnected',
      );
    } catch (error) {
      console.error(
        'Não foi possível verificar as conexões de Open Finance:',
        error,
      );

      return true;
    }
  }
}
