import {
  Body,
  Controller,
  Post,
  Request as NestRequest,
  UseGuards,
  Get,
  Patch,
  Param,
  Delete
} from '@nestjs/common';

import { RecurringExpensesService } from './recurring-expenses.service';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import type { Request } from 'express';
import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('recurring-expenses')
export class RecurringExpensesController {
  constructor(
    private readonly recurringExpensesService: RecurringExpensesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: CreateRecurringExpenseDto,
  ) {
    return this.recurringExpensesService.createRecurringExpense(
      req.user.id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
@Get()
getRecurringExpenses(
  @NestRequest() req: AuthenticatedRequest,
) {
  return this.recurringExpensesService.getRecurringExpensesByUserId(
    req.user.id,
  );
}

@UseGuards(JwtAuthGuard)
@Patch(':id')
update(
  @NestRequest() req: AuthenticatedRequest,
  @Param('id') recurringExpenseId: string,
  @Body() dto: UpdateRecurringExpenseDto,
) {
  return this.recurringExpensesService.updateRecurringExpense(
    req.user.id,
    recurringExpenseId,
    dto,
  );
}

@UseGuards(JwtAuthGuard)
@Delete(':id')
remove(
  @NestRequest() req: AuthenticatedRequest,
  @Param('id') recurringExpenseId: string,
) {
  return this.recurringExpensesService.deleteRecurringExpense(
    req.user.id,
    recurringExpenseId,
  );
}
}