import {
  Controller,
  Post,
  Request as NestRequest,
  UseGuards,
  Body,
  Patch,
} from '@nestjs/common';
import { financesService } from './finances.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { UpdateMonthlyIncomeDto } from './dto/update-monthly-income.dto';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('finances')
export class financesController {
  constructor(private readonly financeService: financesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@NestRequest() req: AuthenticatedRequest) {
    return this.financeService.createfinance(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('income')
  getIncome(@NestRequest() req: AuthenticatedRequest) {
      return this.financeService.getfinanceIncomeByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transactions')
  getTransactions(@NestRequest() req: AuthenticatedRequest) {
    return this.financeService.getfinanceTransactionsByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete')
  deletefinance(@NestRequest() req: AuthenticatedRequest) {
    return this.financeService.deletefinanceByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('income')
  updateIncome(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: UpdateMonthlyIncomeDto,
  ) {
    return this.financeService.updateMonthlyIncome(
      req.user.id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('get')
  getfinance(@NestRequest() req: AuthenticatedRequest) {
    return this.financeService.getfinanceByUserId(req.user.id);
  }
}