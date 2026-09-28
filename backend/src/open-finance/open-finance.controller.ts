import {
  Controller,
  Body,
  Post,
  Get,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { OpenFinanceService } from './open-finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('open-finance')
export class OpenFinanceController {
  constructor(
    private readonly openFinanceService: OpenFinanceService,
  ) {}

  @Post('connect-token')
  @UseGuards(JwtAuthGuard)
  async createConnectToken(@Req() req: { user?: { id: string } }) {
    if (!req.user) {
      throw new Error('Authenticated user not found');
    }

    return this.openFinanceService.createConnectToken(req.user.id);
  }

  @Post('connect')
    @UseGuards(JwtAuthGuard)
    async connect(
      @Req() req: { user?: { id: string } },
      @Body() body: { itemId: string },
    ) {
      if (!req.user) {
        throw new Error('Authenticated user not found')
      }

      return this.openFinanceService.connectItem(
        req.user.id,
        body.itemId,
      )
    }

  @Get('connections')
  @UseGuards(JwtAuthGuard)
  async getConnections(
    @Req() req: { user?: { id: string } },
  ) {
    if (!req.user) {
      throw new Error('Authenticated user not found');
    }

    return this.openFinanceService.getConnections(
      req.user.id,
    );
  }

  @Get('connections/:connectionId/accounts')
  @UseGuards(JwtAuthGuard)
  async getAccounts(
    @Req() req: { user?: { id: string } },
    @Param('connectionId') connectionId: string,
  ) {
    if (!req.user) {
      throw new Error('Authenticated user not found');
    }

    return this.openFinanceService.getAccounts(
      req.user.id,
      connectionId,
    );
  }

  @Get(
  'connections/:connectionId/accounts/:accountId/transactions',
)
@UseGuards(JwtAuthGuard)
  async getTransactions(
    @Req() req: { user?: { id: string } },
    @Param('connectionId') connectionId: string,
    @Param('accountId') accountId: string,
  ) {
    if (!req.user) {
      throw new Error('Authenticated user not found');
    }

    return this.openFinanceService.getTransactions(
      req.user.id,
      connectionId,
      accountId,
    );
  }
}