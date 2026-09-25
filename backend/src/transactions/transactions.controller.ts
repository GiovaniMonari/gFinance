import {
  Body,
  Controller,
  Post,
  Request as NestRequest,
  UseGuards,
  Get,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  Param,
} from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { Query } from '@nestjs/common';
import { PaginationDto } from './dto/paginaton.dto';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@NestRequest() req: AuthenticatedRequest, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.createTransaction(
      req.user.id,
      dto,
    );
  }

@Get()
@UseGuards(JwtAuthGuard)
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
  getFinancialSummary(
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.transactionsService.getFinancialSummary(
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('expenses-by-category')
  getExpensesByCategory(
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.transactionsService.getExpensesByCategory(
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('monthly-summary')
  getMonthlySummary(
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.transactionsService.getMonthlySummary(
      req.user.id,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
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