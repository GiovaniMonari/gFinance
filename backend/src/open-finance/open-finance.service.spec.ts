import {
  BadGatewayException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { OpenFinanceService } from './open-finance.service';

/*
 * `@nestjs/axios` and `@nestjs/config` ship untranspiled ESM while the
 * project's jest config only transforms `src`, so requiring either dies
 * before the suite starts. Neither class is used directly here — the service
 * gets fakes below — so the modules are stubbed rather than rewriting
 * transform rules for the whole project.
 */
jest.mock('@nestjs/axios', () => ({
  HttpService: class HttpService {},
}));

jest.mock('@nestjs/config', () => ({
  ConfigService: class ConfigService {},
}));

/**
 * The disconnect path is the only place in this controller that has to reason
 * about somebody else's status codes, so this covers the translation itself:
 * the call it makes, and what each downstream answer becomes for the app.
 */
describe('OpenFinanceService', () => {
  let http: { delete: jest.Mock };
  let service: OpenFinanceService;

  beforeEach(() => {
    http = { delete: jest.fn() };

    service = new OpenFinanceService(
      http as never,
      {
        getOrThrow: (key: string) =>
          key === 'OPEN_FINANCE_URL'
            ? 'http://open-finance.test'
            : 'internal-secret',
      } as never,
    );
  });

  /** Simulate a rejected call carrying a downstream response. */
  function downstream(status: number, data?: unknown) {
    http.delete.mockReturnValue(
      throwError(() => ({ response: { status, data } })),
    );
  }

  /** A downstream answer becomes an exception; read what it says. */
  async function rejected(): Promise<unknown> {
    return service
      .disconnectConnection('user-1', 'connection-1')
      .catch((caught: unknown) => caught);
  }

  it('deletes the connection as the authenticated user', async () => {
    http.delete.mockReturnValue(of({ data: { status: 'disconnected' } }));

    await expect(
      service.disconnectConnection('user-1', 'connection-1'),
    ).resolves.toEqual({ status: 'disconnected' });

    expect(http.delete).toHaveBeenCalledWith(
      'http://open-finance.test/connections/connection-1',
      {
        headers: {
          Authorization: 'Bearer internal-secret',
          'X-User-Id': 'user-1',
        },
      },
    );
  });

  it('passes a not-found downstream answer through as 404', async () => {
    downstream(404, { status: 'error', message: 'Conexão não encontrada' });

    const error = await rejected();

    expect(error).toBeInstanceOf(NotFoundException);
    expect((error as Error).message).toBe('Conexão não encontrada');
  });

  it('accepts a downstream `detail` as well as `message`', async () => {
    downstream(409, { detail: 'A conexão já está desconectada' });

    const error = await rejected();

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as Error).message).toBe('A conexão já está desconectada');
  });

  it('reports a provider outage as 502', async () => {
    downstream(502, {
      status: 'error',
      message: 'O provedor de Open Finance está indisponível',
    });

    const error = await rejected();

    expect(error).toBeInstanceOf(BadGatewayException);
    expect((error as Error).message).toBe(
      'O provedor de Open Finance está indisponível',
    );
  });

  it('treats an unreachable service as 502, not as a 500', async () => {
    http.delete.mockReturnValue(throwError(() => new Error('ECONNREFUSED')));

    const error = await rejected();

    expect(error).toBeInstanceOf(BadGatewayException);
    expect((error as Error).message).toBe(
      'O Open Finance está indisponível no momento.',
    );
  });

  it('falls back to a readable sentence when the payload carries none', async () => {
    // NestJS-style validation errors arrive as an array of messages, which
    // is not something to show a person verbatim.
    downstream(422, { message: ['item_id must be a string'] });

    const error = await rejected();

    expect((error as Error).message).toBe(
      'Não foi possível concluir a desconexão. Tente novamente.',
    );
  });
});
