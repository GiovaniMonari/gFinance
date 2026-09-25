import {
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';

@Injectable()
export class RecurringExpensesService implements OnModuleInit {
  constructor(
  private readonly prisma: PrismaService,

  @InjectQueue('recurring-expenses')
  private readonly recurringExpensesQueue: Queue,
) {}

async onModuleInit() {
  await this.recurringExpensesQueue.upsertJobScheduler(
    'recurring-expenses-scheduler',
    {
      every: 24 * 60 * 60 * 1000,
    },
    {
      name: 'process-recurring-expenses',
      data: {},
    },
  );
}

  async createRecurringExpense(
    userId: string,
    dto: CreateRecurringExpenseDto,
  ) {
    const finance = await this.prisma.finance.findUnique({
      where: {
        userId,
      },
    });

    if (!finance) {
      throw new NotFoundException(
        'Financeiro não encontrado para o usuário',
      );
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: dto.categoryId,
          financeId: finance.id,
        },
      });

      if (!category) {
        throw new NotFoundException(
          'Categoria não encontrada para este financeiro',
        );
      }
    }

    const now = new Date();

    let nextExecution = this.getExecutionDate(
      now.getFullYear(),
      now.getMonth(),
      dto.dayOfMonth,
    );

    if (nextExecution < now) {
      nextExecution = this.getExecutionDate(
        now.getFullYear(),
        now.getMonth() + 1,
        dto.dayOfMonth,
      );
    }

    const recurringExpense =
    await this.prisma.recurringExpense.create({
      data: {
        financeId: finance.id,
        categoryId: dto.categoryId,
        amount: dto.amount,
        description: dto.description,
        dayOfMonth: dto.dayOfMonth,
        nextExecution,
      },
    });

  await this.recurringExpensesQueue.add(
    'process-recurring-expense',
    {
      recurringExpenseId: recurringExpense.id,
    },
  );

  return recurringExpense;

  }

  async getRecurringExpensesByUserId(userId: string) {
  const finance = await this.prisma.finance.findUnique({
    where: {
      userId,
    },
  });

  if (!finance) {
    throw new NotFoundException(
      'Financeiro não encontrado para o usuário',
    );
  }

  return this.prisma.recurringExpense.findMany({
    where: {
      financeId: finance.id,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      dayOfMonth: 'asc',
    },
  });
}

async updateRecurringExpense(
  userId: string,
  recurringExpenseId: string,
  dto: UpdateRecurringExpenseDto,
) {
  const finance = await this.prisma.finance.findUnique({
    where: {
      userId,
    },
  });

  if (!finance) {
    throw new NotFoundException(
      'Financeiro não encontrado para o usuário',
    );
  }

  const recurringExpense =
    await this.prisma.recurringExpense.findFirst({
      where: {
        id: recurringExpenseId,
        financeId: finance.id,
      },
    });

  if (!recurringExpense) {
    throw new NotFoundException(
      'Despesa recorrente não encontrada',
    );
  }

  if (dto.categoryId) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: dto.categoryId,
        financeId: finance.id,
      },
    });

    if (!category) {
      throw new NotFoundException(
        'Categoria não encontrada para este financeiro',
      );
    }
  }

  let nextExecution = recurringExpense.nextExecution;

  if (dto.dayOfMonth !== undefined) {
    const now = new Date();

    nextExecution = this.getExecutionDate(
      now.getFullYear(),
      now.getMonth(),
      dto.dayOfMonth,
    );

    if (nextExecution < now) {
      nextExecution = this.getExecutionDate(
        now.getFullYear(),
        now.getMonth() + 1,
        dto.dayOfMonth,
      );
    }
  }

  return this.prisma.recurringExpense.update({
    where: {
      id: recurringExpenseId,
    },
    data: {
      amount: dto.amount,
      description: dto.description,
      categoryId: dto.categoryId,
      dayOfMonth: dto.dayOfMonth,
      active: dto.active,
      nextExecution
    },
  });
}

async deleteRecurringExpense(
  userId: string,
  recurringExpenseId: string,
) {
  const finance = await this.prisma.finance.findUnique({
    where: {
      userId,
    },
  });

  if (!finance) {
    throw new NotFoundException(
      'Financeiro não encontrado para o usuário',
    );
  }

  const recurringExpense =
    await this.prisma.recurringExpense.findFirst({
      where: {
        id: recurringExpenseId,
        financeId: finance.id,
      },
    });

  if (!recurringExpense) {
    throw new NotFoundException(
      'Despesa recorrente não encontrada',
    );
  }

  return this.prisma.recurringExpense.update({
    where: {
      id: recurringExpenseId,
    },
    data: {
      active: false,
    },
  });
}

async scheduleRecurringExpenses() {
  await this.recurringExpensesQueue.upsertJobScheduler(
    'recurring-expenses-scheduler',
    {
      every: 24 * 60 * 60 * 1000,
    },
    {
      name: 'process-recurring-expenses',
      data: {},
    },
  );
}

private getExecutionDate(
  year: number,
  month: number,
  day: number,
): Date {
  const lastDayOfMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  const validDay = Math.min(
    day,
    lastDayOfMonth,
  );

  return new Date(
    year,
    month,
    validDay,
  );
}
}