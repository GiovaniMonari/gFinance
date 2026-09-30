import {
  Controller,
  Body,
  Delete,
  Post,
  Get,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OpenFinanceService } from './open-finance.service';
import { OpenFinanceAccessGuard } from './open-finance-access.guard';
import { OpenFinanceAccessService } from './open-finance-access.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Open Finance')
@ApiBearerAuth()
@Controller('open-finance')
export class OpenFinanceController {
  constructor(
    private readonly openFinanceService: OpenFinanceService,
    private readonly accessService: OpenFinanceAccessService,
  ) {}

  /**
   * Whether this account may start a connection right now.
   *
   * The screen asks this before it draws anything, so the restriction reads
   * as a stated fact rather than as a button that disappears. It answers the
   * same question the guard below enforces — one method, one answer.
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Req() req: { user?: { id: string } }) {
    if (!req.user) {
      throw new Error('Authenticated user not found');
    }

    return this.accessService.getAvailability(req.user.id);
  }

  @Post('connect-token')
  @UseGuards(JwtAuthGuard, OpenFinanceAccessGuard)
  async createConnectToken(@Req() req: { user?: { id: string } }) {
    if (!req.user) {
      throw new Error('Authenticated user not found');
    }

    return this.openFinanceService.createConnectToken(req.user.id);
  }

  @Post('connect')
    @UseGuards(JwtAuthGuard, OpenFinanceAccessGuard)
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

  @Delete('connections/:connectionId')
  @UseGuards(JwtAuthGuard)
  async disconnect(
    @Req() req: { user?: { id: string } },
    @Param('connectionId') connectionId: string,
  ) {
    if (!req.user) {
      throw new Error('Authenticated user not found');
    }

    return this.openFinanceService.disconnectConnection(
      req.user.id,
      connectionId,
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