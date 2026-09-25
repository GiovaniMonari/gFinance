import { Module } from '@nestjs/common';

import { RecurringExpensesController } from './recurring-expenses.controller';
import { RecurringExpensesService } from './recurring-expenses.service';
import { RecurringExpensesProcessor } from './recurring-expenses.processor';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [RecurringExpensesController],
  providers: [
    RecurringExpensesService,
    RecurringExpensesProcessor,
  ],
})
export class RecurringExpensesModule {}