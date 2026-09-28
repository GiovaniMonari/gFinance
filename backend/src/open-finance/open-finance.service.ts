import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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
}