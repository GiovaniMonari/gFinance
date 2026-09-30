import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
} from '@nestjs/common';
import type { Request } from 'express';
import { OpenFinanceAccessService } from './open-finance-access.service';

/**
 * Closes the connection flow to accounts that may not start one.
 *
 * Placed **after** `JwtAuthGuard` in `@UseGuards(JwtAuthGuard, …)`, so by the
 * time it runs the request already carries `req.user` and an unauthenticated
 * call has been turned away. It guards the two routes that begin a
 * connection — the connect token and the item exchange — and nothing else:
 * reading a connection, or ending one, is never something a restriction
 * should stand in front of.
 *
 * Removing the restriction later is `OPEN_FINANCE_RELEASED = true` in
 * `open-finance-access.ts`; removing the mechanism itself is dropping the
 * guard from those two decorators.
 */
@Injectable()
export class OpenFinanceAccessGuard implements CanActivate {
  constructor(private readonly accessService: OpenFinanceAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { id?: string } }>();

    const userId = request.user?.id;

    if (!userId) {
      // The JWT guard ran first, so this is a wiring mistake rather than a
      // caller without a token — but it must not read as "allowed".
      throw new UnauthorizedException();
    }

    if (await this.accessService.canConnect(userId)) {
      return true;
    }

    throw new ForbiddenException(
      'O Open Finance está indisponível no momento para novas conexões. Tente novamente mais tarde.',
    );
  }
}
