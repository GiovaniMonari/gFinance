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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@ApiTags('Finances')
@ApiBearerAuth()
@Controller('finances')
export class financesController {
  constructor(private readonly financeService: financesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar uma conta financeira' })
  create(@NestRequest() req: AuthenticatedRequest) {
    return this.financeService.createfinance(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('income')
  @ApiOperation({ summary: 'Consultar renda mensal' })
  getIncome(@NestRequest() req: AuthenticatedRequest) {
    return this.financeService.getfinanceIncomeByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transactions')
  @ApiOperation({ summary: 'Consultar transações financeiras' })
  getTransactions(@NestRequest() req: AuthenticatedRequest) {
    return this.financeService.getfinanceTransactionsByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete')
  @ApiOperation({ summary: 'Excluir conta financeira' })
  deletefinance(@NestRequest() req: AuthenticatedRequest) {
    return this.financeService.deletefinanceByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('income')
  @ApiOperation({ summary: 'Atualizar renda mensal' })
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
  @ApiOperation({ summary: 'Consultar conta financeira' })
  getfinance(@NestRequest() req: AuthenticatedRequest) {
    return this.financeService.getfinanceByUserId(req.user.id);
  }
}