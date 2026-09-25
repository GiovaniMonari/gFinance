import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';
import { UpdateFinancialGoalProgressDto } from './dto/update-financial-goal-progress.dto';
import { CreateFinancialGoalTransactionDto } from './dto/create-financial-goal-transaction.dto';

@Injectable()
export class FinancialGoalsService {
  constructor(private readonly prisma: PrismaService) {}

    async createFinancialGoal(userId: string, dto: CreateFinancialGoalDto) {

        const finance = await this.prisma.finance.findUnique({
            where: {
                userId,
            },
        });

        if (!finance) {
            throw new NotFoundException('Finanças não encontradas')
        }

        return this.prisma.financialGoal.create({
            data: {
                financeId: finance.id,
                name: dto.name,
                targetAmount: dto.targetAmount,
                deadline: dto.deadline ? new Date(dto.deadline) : null,
                currentAmount: 0,
                active: true,
            }
        })
    }

    async findAll(userId: string) {
        const finance = await this.prisma.finance.findUnique({
            where: {
            userId,
            },
        });

        if (!finance) {
            throw new NotFoundException('Finanças não encontradas');
        }

        const goals = await this.prisma.financialGoal.findMany({
            where: {
                financeId: finance.id,
                active: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return goals.map((goal) => this.formatGoal(goal));
    }

    async findOne(userId: string, goalId: string) {

        const finance = await this.prisma.finance.findUnique({
            where: {
                userId,
            },
        });

        if (!finance) {
            throw new NotFoundException('Finanças não encontradas');
        }

        const financialGoal = await this.prisma.financialGoal.findFirst({
        where: {
            id: goalId,
            financeId: finance.id,
            active: true,
        },
        include: {
            _count: {
            select: {
                transactions: true,
            },
            },
        },
        });

        if (!financialGoal) {
        throw new NotFoundException('Meta não encontrada');
        }

        const formattedGoal = this.formatGoal(financialGoal);

        return {
        ...formattedGoal,
        transactionsCount: financialGoal._count.transactions,
        };
    }

    async update(userId: string,goalId: string,dto: UpdateFinancialGoalDto,) {
        const finance = await this.prisma.finance.findUnique({
            where: {
            userId,
            },
        });

        if (!finance) {
            throw new NotFoundException('Finanças não encontradas');
        }

        const goal = await this.prisma.financialGoal.findFirst({
            where: {
            id: goalId,
            financeId: finance.id,
            active: true,
            },
        });

        if (!goal) {
            throw new NotFoundException('Meta não encontrada');
        }

        return this.prisma.financialGoal.update({
            where: {
            id: goal.id,
            },
            data: {
            ...(dto.name !== undefined && {
                name: dto.name,
            }),
            ...(dto.targetAmount !== undefined && {
                targetAmount: dto.targetAmount,
            }),
            ...(dto.deadline !== undefined && {
                deadline: new Date(dto.deadline),
            }),
            },
        });
    }

    async updateProgress(
    userId: string,
    goalId: string,
    dto: CreateFinancialGoalTransactionDto,
    ) {
        const finance = await this.prisma.finance.findUnique({
            where: {
            userId,
            },
        });

        if (!finance) {
            throw new NotFoundException('Finanças não encontradas');
        }

        const goal = await this.prisma.financialGoal.findFirst({
            where: {
            id: goalId,
            financeId: finance.id,
            active: true,
            },
        });

        if (!goal) {
            throw new NotFoundException('Meta não encontrada');
        }

        const currentAmount = Number(goal.currentAmount);
        const targetAmount = Number(goal.targetAmount);

        if (currentAmount >= targetAmount) {
            throw new BadRequestException(
                'Não é possível adicionar valor a uma meta já concluída',
            );
        }

        if (currentAmount + dto.amount > targetAmount) {
            throw new BadRequestException(
                'O valor adicionado não pode ultrapassar o valor restante da meta',
            );
        }

        const newAmount = currentAmount + dto.amount;

        return this.prisma.$transaction(async (tx) => {
            const updatedGoal = await tx.financialGoal.update({
            where: {
                id: goal.id,
            },
            data: {
                currentAmount: newAmount,
            },
            });

            await tx.financialGoalTransaction.create({
            data: {
                goalId: goal.id,
                type: 'DEPOSIT',
                amount: dto.amount,
            },
            });

            return updatedGoal;
        });
    }

    private formatGoal(goal: any) {
        const targetAmount = Number(goal.targetAmount);
        const currentAmount = Number(goal.currentAmount);

        const progress = Math.min(
            (currentAmount / targetAmount) * 100,
            100,
        );

        const remainingAmount = Math.max(
            targetAmount - currentAmount,
            0,
        );

        let status = 'IN_PROGRESS';

        if (currentAmount >= targetAmount) {
            status = 'COMPLETED';
        } else if (
            goal.deadline &&
            new Date(goal.deadline) < new Date()
        ) {
            status = 'OVERDUE';
        }

        return {
            id: goal.id,
            name: goal.name,
            targetAmount,
            currentAmount,
            deadline: goal.deadline,
            active: goal.active,
            createdAt: goal.createdAt,
            updatedAt: goal.updatedAt,
            progress: Number(progress.toFixed(2)),
            remainingAmount,
            status,
        };
    }

    async remove(userId: string, goalId: string) {
        const finance = await this.prisma.finance.findUnique({
            where: {
            userId,
            },
        });

        if (!finance) {
            throw new NotFoundException('Finanças não encontradas');
        }

        const goal = await this.prisma.financialGoal.findFirst({
            where: {
            id: goalId,
            financeId: finance.id,
            },
        });

        if (!goal) {
            throw new NotFoundException('Meta não encontrada');
        }

        return this.prisma.financialGoal.update({
            where: {
            id: goal.id,
            },
            data: {
            active: false,
            },
        });
    }

    async removeProgress(
    userId: string,
    goalId: string,
    dto: CreateFinancialGoalTransactionDto,
    ) {
        const finance = await this.prisma.finance.findUnique({
            where: {
            userId,
            },
        });

        if (!finance) {
            throw new NotFoundException('Finanças não encontradas');
        }

        const goal = await this.prisma.financialGoal.findFirst({
            where: {
            id: goalId,
            financeId: finance.id,
            active: true,
            },
        });

        if (!goal) {
            throw new NotFoundException('Meta não encontrada');
        }

        const currentAmount = Number(goal.currentAmount);

        if (dto.amount > currentAmount) {
            throw new BadRequestException(
            'O valor removido não pode ser maior que o valor atual da meta',
            );
        }

        const newAmount = currentAmount - dto.amount;

        return this.prisma.$transaction(async (tx) => {
            const updatedGoal = await tx.financialGoal.update({
            where: {
                id: goal.id,
            },
            data: {
                currentAmount: newAmount,
            },
            });

            await tx.financialGoalTransaction.create({
            data: {
                goalId: goal.id,
                type: 'WITHDRAW',
                amount: dto.amount,
            },
            });

            return updatedGoal;
        });
    }

    async findTransactions(userId: string, goalId: string) {
        const finance = await this.prisma.finance.findUnique({
            where: {
            userId,
            },
        });

        if (!finance) {
            throw new NotFoundException('Finanças não encontradas');
        }

        const goal = await this.prisma.financialGoal.findFirst({
            where: {
            id: goalId,
            financeId: finance.id,
            },
        });

        if (!goal) {
            throw new NotFoundException('Meta não encontrada');
        }

        return this.prisma.financialGoalTransaction.findMany({
            where: {
            goalId: goal.id,
            },
            orderBy: {
            createdAt: 'desc',
            },
        });
    }
}
