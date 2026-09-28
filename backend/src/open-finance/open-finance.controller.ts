import {
  Controller,
  Post,
  Req,
  UseGuards,
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
}