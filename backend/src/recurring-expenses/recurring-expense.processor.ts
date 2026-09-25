import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Processor('recurring-expenses')
export class RecurringExpenseProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job) {
    if (job.name !== 'send-reminder') {
      return;
    }

    const recurringExpense =
      await this.prisma.recurringExpense.findUnique({
        where: {
          id: job.data.recurringExpenseId,
        },
        include: {
          finance: {
            include: {
              user: true,
            },
          },
        },
      });

    if (!recurringExpense) {
      return;
    }

    await this.emailService.sendRecurringExpenseReminder({
      to: recurringExpense.finance.user.email,
      description:
        recurringExpense.description || 'Conta recorrente',
      amount: Number(recurringExpense.amount),
      dueDate: recurringExpense.nextExecution,
    });
  }
}