import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateMonthlyIncomeDto } from './dto/update-monthly-income.dto';

@Injectable()
export class financesService {
    constructor(private readonly prisma: PrismaService) {}

    createfinance(userId: string) {
        return this.prisma.finance.upsert({
            where: {
                userId,
            },
            update: {},
            create: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    }

    getfinanceByUserId(userId: string) {
        return this.prisma.finance.findUnique({
            where: {
                userId,
            },
        });
    }

   getfinanceIncomeByUserId(userId: string) {
    return this.prisma.finance.findUnique({
        where: {
            userId,
        },
        select: {
            monthlyIncome: true,
        },
    });
}

    getfinanceTransactionsByUserId(userId: string) {
        return this.prisma.transaction.findMany({
            where: {
                finance: {
                    userId,
                },
            },
        });
    }

    deletefinanceByUserId(userId: string) {
        return this.prisma.finance.delete({
            where: {
                userId,
            },
        });
    }

    async updateMonthlyIncome(
    userId: string,
    dto: UpdateMonthlyIncomeDto,
    ) {
        return this.prisma.finance.update({
            where: {
                userId,
            },
            data: {
                monthlyIncome: dto.monthlyIncome,
            },
        });
    }
}