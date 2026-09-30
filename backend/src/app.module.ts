import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
import { OpenFinanceModule } from './open-finance/open-finance.module';
import { EmailModule } from './email/email.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    /*
     * A ceiling on how fast any one address can drive the API, so credential
     * guessing and enumeration are answered with a 429 instead of running for
     * as long as the caller keeps trying. The number is deliberately loose for
     * normal use — a signed-in session spends a handful of requests on each
     * screen — and the tighter per-account limit lives on the auth routes.
     */
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 300 }],
      errorMessage:
        'Muitas tentativas. Aguarde alguns segundos e tente novamente.',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    financeModule,
    TransactionsModule,
    CategoriesModule,
    RecurringExpensesModule,
    ScheduleModule.forRoot(),
    QueueModule,
    FinancialGoalsModule,
    FinancialReportsModule,
    EmailModule,
    OpenFinanceModule,
  ],
  providers: [
    /*
     * Enforced once for the whole API rather than route by route, so a
     * forgotten endpoint is covered by default and the limit that matters for
     * credentials stays on the auth controller.
     */
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
