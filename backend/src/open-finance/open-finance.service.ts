import {
  BadRequestException,
  BadGatewayException,
  ConflictException,
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * What the Open Finance service answers once a revocation is confirmed
 * upstream. Only the fields the app reads are named; the row itself carries
 * the rest of the connection record.
 */
type DisconnectResponse = {
  status: 'disconnected';
  connection: Record<string, unknown>;
};

@Injectable()
export class OpenFinanceService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async createConnectToken(userId: string) {
    const baseUrl = this.configService.getOrThrow<string>(
      'OPEN_FINANCE_URL',
    );

    const internalToken = this.configService.getOrThrow<string>(
      'INTERNAL_SERVICE_TOKEN',
    );

    const response = await firstValueFrom(
      this.httpService.post(
        `${baseUrl}/connections/pluggy/connect-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${internalToken}`,
            'X-User-Id': userId,
          },
        },
      ),
    );

    return response.data;
  }

  async connectItem(userId: string, itemId: string) {
    const baseUrl = this.configService.getOrThrow<string>(
      'OPEN_FINANCE_URL',
    )

    const internalToken = this.configService.getOrThrow<string>(
      'INTERNAL_SERVICE_TOKEN',
    )

    const response = await firstValueFrom(
      this.httpService.post(
        `${baseUrl}/connections/pluggy/connect`,
        {
          item_id: itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${internalToken}`,
            'X-User-Id': userId,
          },
        },
      ),
    )

    return response.data
  }

  async getConnections(userId: string) {
    const baseUrl = this.configService.getOrThrow<string>(
      'OPEN_FINANCE_URL',
    );

    const internalToken = this.configService.getOrThrow<string>(
      'INTERNAL_SERVICE_TOKEN',
    );

    const response = await firstValueFrom(
      this.httpService.get(
        `${baseUrl}/connections`,
        {
          headers: {
            Authorization: `Bearer ${internalToken}`,
            'X-User-Id': userId,
          },
        },
      ),
    );

    return response.data;
  }

  async getAccounts(
    userId: string,
    connectionId: string,
  ) {
    const baseUrl = this.configService.getOrThrow<string>(
      'OPEN_FINANCE_URL',
    );

    const internalToken = this.configService.getOrThrow<string>(
      'INTERNAL_SERVICE_TOKEN',
    );

    const response = await firstValueFrom(
      this.httpService.get(
        `${baseUrl}/connections/${connectionId}/accounts`,
        {
          headers: {
            Authorization: `Bearer ${internalToken}`,
            'X-User-Id': userId,
          },
        },
      ),
    );

    return response.data;
  }
  async getTransactions(
    userId: string,
    connectionId: string,
    accountId: string,
  ) {
    const baseUrl = this.configService.getOrThrow<string>(
      'OPEN_FINANCE_URL',
    );

    const internalToken = this.configService.getOrThrow<string>(
      'INTERNAL_SERVICE_TOKEN',
    );

    const response = await firstValueFrom(
      this.httpService.get(
        `${baseUrl}/connections/${connectionId}/accounts/${accountId}/transactions`,
        {
          headers: {
            Authorization: `Bearer ${internalToken}`,
            'X-User-Id': userId,
          },
        },
      ),
    );

    return response.data;
  }

  /**
   * Ask the Open Finance service to revoke this connection at Pluggy.
   *
   * The user id travels on the header rather than the URL, taken from the
   * verified JWT, so a caller cannot name somebody else's connection — the
   * downstream service scopes its lookup by both ids and answers 404 when
   * they do not agree.
   *
   * The downstream already answers in pt-BR with the right status code, so
   * its response is re-wrapped instead of collapsed into one generic 500:
   * "conexão não encontrada" and "o provedor está indisponível" call for
   * very different next steps on the screen.
   */
  async disconnectConnection(
    userId: string,
    connectionId: string,
  ): Promise<DisconnectResponse> {
    const baseUrl = this.configService.getOrThrow<string>('OPEN_FINANCE_URL');

    const internalToken = this.configService.getOrThrow<string>(
      'INTERNAL_SERVICE_TOKEN',
    );

    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${baseUrl}/connections/${connectionId}`, {
          headers: {
            Authorization: `Bearer ${internalToken}`,
            'X-User-Id': userId,
          },
        }),
      );

      return response.data as DisconnectResponse;
    } catch (error) {
      throw OpenFinanceService.toDownstreamError(error);
    }
  }

  /**
   * Translate a failed downstream call into the status and message the app
   * should show. An unreachable service is its own case: without a response
   * there is no upstream verdict to repeat, and a bare 500 would read as a
   * bug in the app rather than an outage.
   */
  private static toDownstreamError(error: unknown): Error {
    const response = (
      error as {
        response?: {
          status?: number;
          data?: { message?: unknown; detail?: unknown };
        };
      }
    ).response;

    const status = response?.status;
    const payload = response?.data;

    const raw = payload?.message ?? payload?.detail;

    const message =
      typeof raw === 'string' && raw.trim()
        ? raw
        : 'Não foi possível concluir a desconexão. Tente novamente.';

    if (!status) {
      return new BadGatewayException(
        'O Open Finance está indisponível no momento.',
      );
    }

    switch (status) {
      case 400:
        return new BadRequestException(message);
      case 404:
        return new NotFoundException(message);
      case 409:
        return new ConflictException(message);
      case 502:
      case 503:
      case 504:
        return new BadGatewayException(message);
      default:
        return new HttpException(
          message,
          status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}