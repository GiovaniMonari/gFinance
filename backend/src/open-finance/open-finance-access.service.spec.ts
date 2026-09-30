/*
 * Same stubs as `open-finance.service.spec.ts`: the access service reaches
 * `OpenFinanceService`, which imports two packages that ship untranspiled ESM
 * the project's jest config does not transform. Neither is exercised here.
 */
jest.mock('@nestjs/axios', () => ({
  HttpService: class HttpService {},
}));

jest.mock('@nestjs/config', () => ({
  ConfigService: class ConfigService {},
}));

import { OpenFinanceAccessService } from './open-finance-access.service';

type Connections = Array<{ id: string; status: string }>;

/**
 * The guard and `GET /open-finance/status` both call this service, so it is
 * the place where "who may connect" could disagree with "who is told they may
 * connect". These cover the four accounts the brief calls out, and the cost
 * of each answer: a released feature and an exempt address must not go asking
 * a bank service anything.
 */
describe('OpenFinanceAccessService', () => {
  let findUnique: jest.Mock;
  let getConnections: jest.Mock;
  let service: OpenFinanceAccessService;

  beforeEach(() => {
    findUnique = jest.fn();
    getConnections = jest.fn();

    service = new OpenFinanceAccessService(
      { user: { findUnique } } as never,
      { getConnections } as never,
    );

    delete process.env.OPEN_FINANCE_RELEASED;
  });

  afterAll(() => {
    delete process.env.OPEN_FINANCE_RELEASED;
  });

  function account(email: string | null, connections: Connections) {
    findUnique.mockResolvedValue(email ? { email } : null);
    getConnections.mockResolvedValue({ connections });
  }

  it('blocks a new account that has no link', async () => {
    account('novo@email.com', []);

    await expect(service.canConnect('user-1')).resolves.toBe(false);
    expect(getConnections).toHaveBeenCalledTimes(1);
  });

  it('lets an account that still holds a link connect', async () => {
    account('antiga@email.com', [{ id: 'c1', status: 'connected' }]);

    await expect(service.canConnect('user-1')).resolves.toBe(true);
  });

  it('treats a revoked link as no link at all', async () => {
    account('antiga@email.com', [{ id: 'c1', status: 'disconnected' }]);

    await expect(service.canConnect('user-1')).resolves.toBe(false);
  });

  it('never asks the bank service about the test account', async () => {
    account('gimareeli@gmail.com', []);

    await expect(service.canConnect('user-1')).resolves.toBe(true);
    expect(getConnections).not.toHaveBeenCalled();
  });

  it('answers true without touching the database once released', async () => {
    process.env.OPEN_FINANCE_RELEASED = 'true';

    await expect(service.canConnect('user-1')).resolves.toBe(true);
    expect(findUnique).not.toHaveBeenCalled();
    expect(getConnections).not.toHaveBeenCalled();
  });

  it('fails open when the link lookup itself fails', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});

    findUnique.mockResolvedValue({ email: 'antiga@email.com' });
    getConnections.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(service.canConnect('user-1')).resolves.toBe(true);

    log.mockRestore();
  });

  it('answers the status endpoint with the same decision', async () => {
    account('novo@email.com', []);

    await expect(service.getAvailability('user-1')).resolves.toEqual({
      available: false,
    });
  });
});
