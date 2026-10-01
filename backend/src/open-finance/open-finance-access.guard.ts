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
 * call has been turned away. While the feature is closed for app users it
 * guards every route that touches Open Finance except `GET /status` — the
 * endpoint that tells the screen the flow is unavailable must stay readable
 * so the restriction reads as a stated fact rather than a hanging request.
 *
 * Removing the restriction later is `OPEN_FINANCE_RELEASED = true` in
 * `open-finance-access.ts`; removing the mechanism itself is dropping the
 * guard from those decorators.
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
