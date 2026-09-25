import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { FinancialReportQueryDto } from './dto/financial-report-query.dto';

@Injectable()
export class FinancialReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePdf(userId: string, query: FinancialReportQueryDto) {
    const finance = await this.prisma.finance.findUnique({
      where: {
        userId,
      },
    });

    if (!finance) {
      throw new NotFoundException('Financeiro não encontrado');
    }

    const transactions = await this.prisma.transaction.findMany({
    where: {
            financeId: finance.id,
            status: 'COMPLETED',
            createdAt: {
            ...(query.startDate && {
                gte: new Date(query.startDate),
            }),
            ...(query.endDate && {
                lte: new Date(`${query.endDate}T23:59:59.999`),
            }),
            },
        },
        include: {
            category: true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    const goals = await this.prisma.financialGoal.findMany({
        where: {
            financeId: finance.id,
            active: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const totalIncome = transactions
      .filter((transaction) => transaction.type === 'INCOME')
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const totalExpenses = transactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const totalDeposits = transactions
      .filter((transaction) => transaction.type === 'DEPOSIT')
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const balance = totalIncome + totalDeposits - totalExpenses;

    const expensesByCategory = new Map<string, number>();

    transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .forEach((transaction) => {
        const categoryName =
        transaction.category?.name || 'Sem categoria';

        const current = expensesByCategory.get(categoryName) || 0;

        expensesByCategory.set(
        categoryName,
        current + Number(transaction.amount),
        );
    });

    const categorySummary = Array.from(
    expensesByCategory.entries(),
    )
    .map(([category, amount]) => ({
        category,
        amount,
        percentage:
        totalExpenses > 0
            ? (amount / totalExpenses) * 100
            : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

    const financialAnalysis = this.generateFinancialAnalysis(
        totalIncome,
        totalExpenses,
        balance,
        categorySummary,
    );
    
    const document = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    this.addPageHeaderAndFooter(document);


    document.fontSize(20).text('Relatório Financeiro', {
      align: 'center',
    });

    document.moveDown();

    document
      .fontSize(10)
      .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, {
        align: 'center',
      });

    document.moveDown(2);

    document.fontSize(16).text('Resumo financeiro');

    document.moveDown();

    document
      .fontSize(12)
      .text(`Receitas: ${this.formatCurrency(totalIncome)}`)
      .text(`Despesas: ${this.formatCurrency(totalExpenses)}`)
      .text(`Depósitos: ${this.formatCurrency(totalDeposits)}`)
      .text(`Saldo: ${this.formatCurrency(balance)}`)
      .text(`Quantidade de transações: ${transactions.length}`);
    
    document.moveDown(2);

    this.drawBarChart(
        document,
        totalIncome,
        totalExpenses,
    );

    this.checkPageBreak(document, 150);

    document.moveDown(2);

    document.fontSize(16).text('Despesas por categoria');

    document.moveDown();

    categorySummary.forEach((item) => {
    this.checkPageBreak(document, 30);

    document
        .fontSize(11)
        .text(
        `${item.category}: ${this.formatCurrency(item.amount)} (${item.percentage.toFixed(2)}%)`,
        );
    });

    document.moveDown();

    this.checkPageBreak(document, 120);

    document.moveDown(2);

    document.fontSize(16).text('Análise do período');

    document.moveDown();

    financialAnalysis.forEach((item) => {
    document
        .fontSize(11)
        .text(`• ${item}`);

    document.moveDown(0.5);
    });

    document.moveDown();

    document.fontSize(16).text('Transações');

    document.moveDown();

    transactions.forEach((transaction) => {
    this.checkPageBreak(document, 40);

        const date = new Date(transaction.createdAt).toLocaleDateString(
            'pt-BR',
        );

        const description = transaction.description || 'Sem descrição';

        document
            .fontSize(10)
            .text(
            `${date} - ${transaction.type} - ${description} - ${this.formatCurrency(
                Number(transaction.amount),
            )}`,
        );
    });

    document.moveDown(2);

    document.fontSize(16).text('Metas financeiras');

    document.moveDown();

    goals.forEach((goal) => {
        this.checkPageBreak(document,130)
        const targetAmount = Number(goal.targetAmount);
        const currentAmount = Number(goal.currentAmount);

        const progress = Math.min(
            (currentAmount / targetAmount) * 100,
            100,
        );

        const remaining = Math.max(
            targetAmount - currentAmount,
            0,
        );

        let status = 'Em andamento';

        if (currentAmount >= targetAmount) {
            status = 'Concluída';
        } else if (
            goal.deadline &&
            new Date(goal.deadline) < new Date()
        ) {
            status = 'Atrasada';
        }

        document
            .fontSize(11)
            .text(`Meta: ${goal.name}`)
            .text(`Valor objetivo: R$ ${this.formatCurrency(targetAmount)}`)
            .text(`Valor atual: R$ ${this.formatCurrency(currentAmount)}`)
            .text(`Progresso: ${progress.toFixed(2)}%`)
            .text(`Valor restante: R$ ${this.formatCurrency(remaining)}`)
            .text(
            `Prazo: ${
                goal.deadline
                ? new Date(goal.deadline).toLocaleDateString('pt-BR')
                : 'Não definido'
            }`,
            )
            .text(`Status: ${status}`);

        document.moveDown();
        });

    return document;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    }

    private drawBarChart(
    document: PDFKit.PDFDocument,
    income: number,
    expenses: number,
    ) {
        const maxValue = Math.max(income, expenses, 1);

        const chartX = 80;
        const chartY = document.y + 30;
        const chartWidth = 400;
        const barHeight = 30;

        document.fontSize(14).text('Receitas x Despesas');

        document.moveDown();

        // Receita
        const incomeWidth = (income / maxValue) * chartWidth;

        document
            .fontSize(10)
            .text(`Receitas - ${this.formatCurrency(income)}`, chartX, chartY);

        document
            .rect(
            chartX,
            chartY + 18,
            incomeWidth,
            barHeight,
            )
            .fill('#4CAF50');

        // Despesas
        const expenseY = chartY + 70;

        const expenseWidth = (expenses / maxValue) * chartWidth;

        document
            .fillColor('black')
            .fontSize(10)
            .text(
            `Despesas - ${this.formatCurrency(expenses)}`,
            chartX,
            expenseY,
            );

        document
            .rect(
            chartX,
            expenseY + 18,
            expenseWidth,
            barHeight,
            )
            .fill('#F44336');

        document.fillColor('black');

        document.y = expenseY + barHeight + 30;
    }

    private checkPageBreak(
    document: PDFKit.PDFDocument,
    requiredSpace = 60,
    ) {
        const pageHeight = document.page.height;
        const bottomMargin = document.page.margins.bottom;

        if (document.y + requiredSpace > pageHeight - bottomMargin) {
            document.addPage();

            this.addPageHeaderAndFooter(document);

            return true;
        }

        return false;
    }

    private addPageHeaderAndFooter(
    document: PDFKit.PDFDocument,
    ) {
        document
            .fontSize(9)
            .fillColor('gray')
            .text(
            'gWallet - Relatório Financeiro',
            document.page.margins.left,
            25,
            {
                align: 'left',
            },
            );

        document
            .fontSize(9)
            .text(
            'Relatório financeiro',
            0,
            document.page.height - 35,
            {
                align: 'center',
            },
            );

        document.fillColor('black');
    }

    private generateFinancialAnalysis(
    income: number,
    expenses: number,
    balance: number,
    categorySummary: {
        category: string;
        amount: number;
        percentage: number;
    }[],
    ): string[] {
        const analysis: string[] = [];

        if (income === 0 && expenses === 0) {
            analysis.push(
            'Não foram identificadas movimentações financeiras no período analisado.',
            );

            return analysis;
        }

        if (balance > 0) {
            analysis.push(
            `O período apresentou saldo positivo de ${this.formatCurrency(balance)}.`,
            );
        } else if (balance < 0) {
            analysis.push(
            `O período apresentou saldo negativo de ${this.formatCurrency(
                Math.abs(balance),
            )}.`,
            );
        } else {
            analysis.push(
            'O período apresentou equilíbrio entre receitas e despesas.',
            );
        }

        if (expenses > 0 && categorySummary.length > 0) {
            const topCategory = categorySummary[0];

            analysis.push(
            `A categoria com maior volume de despesas foi "${topCategory.category}", representando ${topCategory.percentage.toFixed(
                2,
            )}% das despesas totais.`,
            );
        }

        if (income > 0) {
            const expensePercentage = (expenses / income) * 100;

            analysis.push(
            `As despesas corresponderam a ${expensePercentage.toFixed(
                2,
            )}% das receitas registradas no período.`,
            );
        }

        return analysis;
    }
}