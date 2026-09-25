import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class RecurringExpenseScheduler {
  constructor(
  private readonly prisma: PrismaService,

  @InjectQueue('recurring-expenses')
  private readonly recurringExpensesQueue: Queue,
) {}

  @Cron('0 9 * * *')
  async handleRecurringExpenseReminders() {
    const today = new Date();

    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + 2);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const recurringExpenses =
      await this.prisma.recurringExpense.findMany({
        where: {
          active: true,
          nextExecution: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          category: true,
          finance: {
            include: {
              user: true,
            },
          },
        },
      });

    console.log(
      `Despesas recorrentes encontradas para lembrete: ${recurringExpenses.length}`,
    );

    for (const expense of recurringExpenses) {
    await this.recurringExpensesQueue.add(
            'send-reminder',
            {
            recurringExpenseId: expense.id,
            },
            {
            jobId: `reminder:${expense.id}:${expense.nextExecution.toISOString()}`,
            },
        );
    }
  }
}