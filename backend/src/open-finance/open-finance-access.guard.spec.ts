/*
 * The guard reaches `OpenFinanceAccessService`, which reaches
 * `OpenFinanceService`, whose dependencies ship untranspiled ESM. Neither is
 * exercised here — the service is faked below.
 */
jest.mock('@nestjs/axios', () => ({
  HttpService: class HttpService {},
}));

jest.mock('@nestjs/config', () => ({
  ConfigService: class ConfigService {},
}));

import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { OpenFinanceAccessGuard } from './open-finance-access.guard';

/**
 * The guard is what stops the flow rather than merely describing it, so it
 * gets its own coverage: it passes the accounts the policy allows, refuses the
 * rest with a status the app can show, and never proceeds on a request that
 * has no authenticated user — which would otherwise read as "allowed".
 */
describe('OpenFinanceAccessGuard', () => {
  let canConnect: jest.Mock;
  let guard: OpenFinanceAccessGuard;

  beforeEach(() => {
    canConnect = jest.fn();
    guard = new OpenFinanceAccessGuard({ canConnect } as never);
  });

  /** The guard only reads the request the HTTP context hands it. */
  function context(user?: { id?: string }): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => (user ? { user } : {}),
      }),
    } as unknown as ExecutionContext;
  }

  it('allows an account the policy allows', async () => {
    canConnect.mockResolvedValue(true);

    await expect(guard.canActivate(context({ id: 'user-1' }))).resolves.toBe(
      true,
    );
    expect(canConnect).toHaveBeenCalledWith('user-1');
  });

  it('refuses everyone else with a message the app can show', async () => {
    canConnect.mockResolvedValue(false);

    await expect(guard.canActivate(context({ id: 'user-1' }))).rejects.toThrow(
      ForbiddenException,
    );

    await expect(guard.canActivate(context({ id: 'user-1' }))).rejects.toThrow(
      'O Open Finance está indisponível no momento para novas conexões. Tente novamente mais tarde.',
    );
  });

  it('refuses a request the JWT guard did not authenticate', async () => {
    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(canConnect).not.toHaveBeenCalled();
  });
});
