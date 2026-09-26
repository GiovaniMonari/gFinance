import {
  Body,
  Controller,
  Post,
  Request as NestRequest,
  UseGuards,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { PaginationDto } from './dto/paginaton.dto';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Criar uma nova transação',
  })
  create(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.createTransaction(
      req.user.id,
      dto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Listar transações financeiras',
  })
  getTransactions(
    @NestRequest() req: AuthenticatedRequest,
    @Query() pagination: PaginationDto,
  ) {
    return this.transactionsService.getTransactionsByUserId(
      req.user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  @ApiOperation({
    summary: 'Consultar resumo financeiro',
  })
  getFinancialSummary(
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.transactionsService.getFinancialSummary(
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('expenses-by-category')
  @ApiOperation({
    summary: 'Consultar despesas por categoria',
  })
  getExpensesByCategory(
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.transactionsService.getExpensesByCategory(
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('monthly-summary')
  @ApiOperation({
    summary: 'Consultar resumo financeiro mensal',
  })
  getMonthlySummary(
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.transactionsService.getMonthlySummary(
      req.user.id,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Consultar uma transação por ID',
  })
  getTransactionById(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.transactionsService.getTransactionById(
      req.user.id,
      id,
    );
  }
}