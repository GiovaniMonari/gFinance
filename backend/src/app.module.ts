import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { financeModule } from './finances/finances.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { QueueModule } from './queue/queue.module';
import { RecurringExpensesModule } from './recurring-expenses/recurring-expenses.module';
import { FinancialGoalsModule } from './financial-goals/financial-goals.module';
import { FinancialReportsModule } from './financial-reports/financial-reports.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    financeModule,
    TransactionsModule,
    CategoriesModule,
    RecurringExpensesModule,
    ScheduleModule.forRoot(),
    QueueModule,
    FinancialGoalsModule,
    FinancialReportsModule,
    EmailModule
  ],
})
export class AppModule {}