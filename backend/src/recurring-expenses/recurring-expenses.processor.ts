import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';

import { PrismaService } from 'src/prisma/prisma.service';

@Processor('recurring-expenses')
export class RecurringExpensesProcessor extends WorkerHost {
  constructor(
  private readonly prisma: PrismaService,
) {
  super();
}

  async process(job: Job) {

    console.log('Verificando despesas recorrentes...');

  if (
    job.name !== 'process-recurring-expenses' &&
    job.name !== 'process-recurring-expense'
  ) {
    return;
  }

  const now = new Date();

  const recurringExpenses =
    await this.prisma.recurringExpense.findMany({
      where: {
        active: true,
        nextExecution: {
          lte: now,
        },
      },
    });

    console.log(`Despesas recorrentes encontradas: ${recurringExpenses.length}`,);

  for (const recurringExpense of recurringExpenses) {
    let nextExecution = new Date(
      recurringExpense.nextExecution,
    );

    while (nextExecution <= now) {
      const currentExecution = new Date(nextExecution);

      nextExecution = this.getNextExecution(
        nextExecution,
        recurringExpense.dayOfMonth,
        );

      await this.prisma.$transaction([
        this.prisma.transaction.create({
          data: {
            financeId: recurringExpense.financeId,
            categoryId: recurringExpense.categoryId,
            amount: recurringExpense.amount,
            type: 'EXPENSE',
            status: 'COMPLETED',
            description: recurringExpense.description,
            createdAt: currentExecution,
          },
        }),

        this.prisma.recurringExpense.update({
          where: {
            id: recurringExpense.id,
          },
          data: {
            nextExecution,
          },
        }),
      ]);

      console.log(
        `Despesa recorrente processada: ${recurringExpense.id}`,
        `referente a ${currentExecution.toISOString()}`,
      );
    }
  }
}

private getNextExecution(
  date: Date,
  dayOfMonth: number,
): Date {
  const year = date.getFullYear();
  const month = date.getMonth();

  const nextMonth = month + 1;

  const lastDayOfNextMonth = new Date(
    year,
    nextMonth + 1,
    0,
  ).getDate();

  const day = Math.min(
  dayOfMonth,
  lastDayOfNextMonth,
);

  return new Date(
    year,
    nextMonth,
    day,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}
}