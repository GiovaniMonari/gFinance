import { Module } from '@nestjs/common';

import { RecurringExpensesController } from './recurring-expenses.controller';
import { RecurringExpensesService } from './recurring-expenses.service';
import { RecurringExpensesProcessor } from './recurring-expenses.processor';
import { QueueModule } from 'src/queue/queue.module';
import { RecurringExpenseScheduler } from './recurring-expense.scheduler';
import { RecurringExpenseProcessor } from './recurring-expense.processor';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [QueueModule, EmailModule],
  controllers: [RecurringExpensesController],
  providers: [
    RecurringExpensesService,
    RecurringExpensesProcessor,
    RecurringExpenseScheduler,
    RecurringExpenseProcessor
  ],
})
export class RecurringExpensesModule {}