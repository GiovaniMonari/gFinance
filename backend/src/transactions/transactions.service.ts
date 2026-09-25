import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTransactionDto, TransactionType } from "./dto/create-transaction.dto";
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(
  userId: string,
  dto: CreateTransactionDto,
) {
  const finance = await this.prisma.finance.findUnique({
  where: {
    userId,
  },
});

if (!finance) {
  throw new NotFoundException(
    'Conta não encontrada para o usuário',
  );
}

if (
  dto.transactionType === TransactionType.EXPENSE &&
  !dto.categoryId
) {
  throw new BadRequestException(
    'Despesas precisam de uma categoria',
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
      'Categoria não encontrada para esta Conta',
    );
  }
}

const amount = new Prisma.Decimal(dto.amount);

  return this.prisma.transaction.create({
    data: {
      finance: {
        connect: {
          id: finance.id,
        },
      },
      amount,
      type: dto.transactionType,
      description: dto.description,
      category: dto.categoryId
        ? {
            connect: {
              id: dto.categoryId,
            },
          }
        : undefined,
      status: 'COMPLETED',
    },
  });
}

  async getTransactionsByUserId(
    userId: string,
    page = 1,
    limit = 20,
    ) {
    const skip = (page - 1) * limit;

    const finance = await this.prisma.finance.findUnique({
        where: {
        userId,
        },
    });

    if (!finance) {
        throw new NotFoundException(
        'Conta não encontrada para o usuário',
        );
    }

    const where = {
    financeId: finance.id,
    };
    const [transactions, total] = await Promise.all([
    this.prisma.transaction.findMany({
        where,
        orderBy: {
        createdAt: 'desc',
        },
        skip,
        take: limit,
    }),

    this.prisma.transaction.count({
        where,
    }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        data: transactions,
        page,
        limit,
        total,
        totalPages,
    };
    }

    async getTransactionById(userId: string, transactionId: string) {
    const finance = await this.prisma.finance.findUnique({
        where: {
        userId,
        },
    });

    if (!finance) {
        throw new NotFoundException(
        'Conta não encontrada para o usuário',
        );
    }

    const transaction = await this.prisma.transaction.findFirst({
    where: {
        id: transactionId,
        financeId: finance.id,
    },
    });
        

    if (!transaction) {
        throw new NotFoundException(
        'Transação não encontrada',
        );
    }

    return transaction;
    }  

    async getFinancialSummary(userId: string) {
  const finance = await this.prisma.finance.findUnique({
    where: {
      userId,
    },
  });

  if (!finance) {
    throw new NotFoundException(
      'Contao encontrada para o usuário',
    );
  }

  const transactions = await this.prisma.transaction.findMany({
    where: {
      financeId: finance.id,
      status: 'COMPLETED',
    },
    select: {
      amount: true,
      type: true,
    },
  });

  let income = new Prisma.Decimal(0);
  let expenses = new Prisma.Decimal(0);
  let deposits = new Prisma.Decimal(0);

  for (const transaction of transactions) {
    if (transaction.type === 'INCOME') {
      income = income.plus(transaction.amount);
    }

    if (transaction.type === 'EXPENSE') {
      expenses = expenses.plus(transaction.amount);
    }

    if (transaction.type === 'DEPOSIT') {
      deposits = deposits.plus(transaction.amount);
    }
  }

  const available = income
    .plus(deposits)
    .plus(finance.monthlyIncome)
    .minus(expenses);

  return {
    income,
    expenses,
    deposits,
    monthlyIncome: finance.monthlyIncome,
    available,
  };
}

async getExpensesByCategory(userId: string) {
  const finance = await this.prisma.finance.findUnique({
    where: {
      userId,
    },
  });

  if (!finance) {
    throw new NotFoundException(
      'Contao encontrada para o usuário',
    );
  }

  const transactions = await this.prisma.transaction.findMany({
    where: {
      financeId: finance.id,
      type: 'EXPENSE',
      status: 'COMPLETED',
      categoryId: {
        not: null,
      },
    },
    select: {
      amount: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const categories = new Map<
    string,
    {
      categoryId: string;
      categoryName: string;
      total: Prisma.Decimal;
    }
  >();

  for (const transaction of transactions) {
    if (!transaction.category) {
      continue;
    }

    const existing = categories.get(
      transaction.category.id,
    );

    if (existing) {
      existing.total = existing.total.plus(
        transaction.amount,
      );
      continue;
    }

    categories.set(transaction.category.id, {
      categoryId: transaction.category.id,
      categoryName: transaction.category.name,
      total: transaction.amount,
    });
  }

  return Array.from(categories.values()).sort((a, b) =>
    b.total.comparedTo(a.total),
  );
}

async getMonthlySummary(userId: string) {
  const finance = await this.prisma.finance.findUnique({
    where: {
      userId,
    },
  });

  if (!finance) {
    throw new NotFoundException(
      'Conta não encontrada para o usuário',
    );
  }

  const transactions = await this.prisma.transaction.findMany({
    where: {
      financeId: finance.id,
      status: 'COMPLETED',
    },
    select: {
      amount: true,
      type: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const months = new Map<
    string,
    {
      month: string;
      income: Prisma.Decimal;
      expenses: Prisma.Decimal;
      deposits: Prisma.Decimal;
    }
  >();

  for (const transaction of transactions) {
    const date = transaction.createdAt;

    const month = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}`;

    let summary = months.get(month);

    if (!summary) {
      summary = {
        month,
        income: new Prisma.Decimal(0),
        expenses: new Prisma.Decimal(0),
        deposits: new Prisma.Decimal(0),
      };

      months.set(month, summary);
    }

    if (transaction.type === 'INCOME') {
      summary.income = summary.income.plus(
        transaction.amount,
      );
    }

    if (transaction.type === 'EXPENSE') {
      summary.expenses = summary.expenses.plus(
        transaction.amount,
      );
    }

    if (transaction.type === 'DEPOSIT') {
      summary.deposits = summary.deposits.plus(
        transaction.amount,
      );
    }
  }

  return Array.from(months.values())
    .reverse()
    .map((summary) => ({
      ...summary,
      available: summary.income
        .plus(summary.deposits)
        .plus(finance.monthlyIncome)
        .minus(summary.expenses),
    }));
}
}
