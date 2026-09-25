import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { financeModule } from './finances/finances.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { QueueModule } from './queue/queue.module';
import { RecurringExpensesModule } from './recurring-expenses/recurring-expenses.module';
import { FinancialGoalsModule } from './financial-goals/financial-goals.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    financeModule,
    TransactionsModule,
    CategoriesModule,
    RecurringExpensesModule,
    QueueModule,
    FinancialGoalsModule
  ],
})
export class AppModule {}