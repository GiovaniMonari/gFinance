import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { FinancialReportQueryDto } from './dto/financial-report-query.dto';

// Cores do Tema (Palette)
const COLORS = {
  primary: '#1E293B',      // Slate 800
  secondary: '#0F766E',    // Teal 700
  success: '#10B981',      // Emerald 500
  danger: '#EF4444',       // Red 500
  text: '#334155',         // Slate 700
  textMuted: '#64748B',    // Slate 500
  background: '#F8FAFC',   // Slate 50
  border: '#E2E8F0',       // Slate 200
  cardBg: '#FFFFFF',
};

@Injectable()
export class FinancialReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePdf(userId: string, query: FinancialReportQueryDto) {
    const finance = await this.prisma.finance.findUnique({
      where: { userId },
    });

    if (!finance) {
      throw new NotFoundException('Financeiro não encontrado');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        financeId: finance.id,
        status: 'COMPLETED',
        createdAt: {
          ...(query.startDate && { gte: new Date(query.startDate) }),
          ...(query.endDate && { lte: new Date(`${query.endDate}T23:59:59.999`) }),
        },
      },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });

    const goals = await this.prisma.financialGoal.findMany({
      where: { financeId: finance.id, active: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalDeposits = transactions
      .filter((t) => t.type === 'DEPOSIT')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const balance = totalIncome + totalDeposits - totalExpenses;

    const expensesByCategory = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const catName = t.category?.name || 'Sem categoria';
        expensesByCategory.set(catName, (expensesByCategory.get(catName) || 0) + Number(t.amount));
      });

    const categorySummary = Array.from(expensesByCategory.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
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
      margin: 40,
      bufferPages: true, // Permite numeração de páginas ao final
    });

    // Header inicial da primeira página
    this.renderHeader(document);

    // 1. Título do Relatório
    document
      .fontSize(22)
      .fillColor(COLORS.primary)
      .text('Relatório Financeiro', { align: 'left' });

    document
      .fontSize(10)
      .fillColor(COLORS.textMuted)
      .text(`Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);

    document.moveDown(1.5);

    // 2. Cards de Resumo Financeiro
    this.renderSummaryCards(document, totalIncome, totalExpenses, totalDeposits, balance);

    document.moveDown(1.5);

    // 3. Gráfico de Comparação (Receitas x Despesas)
    this.checkPageBreak(document, 140);
    this.renderSectionTitle(document, 'Visão Geral (Receitas x Despesas)');
    this.drawBarChart(document, totalIncome, totalExpenses);

    document.moveDown(1.5);

    // 4. Análise do Período
    this.checkPageBreak(document, 120);
    this.renderSectionTitle(document, 'Análise do Período');
    this.renderAnalysisBox(document, financialAnalysis);

    document.moveDown(1.5);

    // 5. Despesas por Categoria
    if (categorySummary.length > 0) {
      this.checkPageBreak(document, 120);
      this.renderSectionTitle(document, 'Despesas por Categoria');
      this.renderCategoryTable(document, categorySummary);
      document.moveDown(1.5);
    }

    // 6. Lista de Transações
    this.checkPageBreak(document, 120);
    this.renderSectionTitle(document, `Transações (${transactions.length})`);
    this.renderTransactionsList(document, transactions);

    document.moveDown(1.5);

    // 7. Metas Financeiras
    if (goals.length > 0) {
      this.checkPageBreak(document, 120);
      this.renderSectionTitle(document, 'Metas Financeiras');
      this.renderGoals(document, goals);
    }

    // Aplica rodapés e numeração em todas as páginas geradas
    this.applyFooters(document);

    return document;
  }

  // --- MÉTODOS DE RENDERIZAÇÃO E DESIGN ---

  private renderHeader(doc: PDFKit.PDFDocument) {
    doc
      .fontSize(10)
      .fillColor(COLORS.secondary)
      .text('gWallet', 40, 30, { continued: true })
      .fillColor(COLORS.textMuted)
      .text(' | Gestão Financeira Pessoal', { align: 'left' });

    doc
      .moveTo(40, 48)
      .lineTo(doc.page.width - 40, 48)
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .stroke();

    doc.y = 60; // Ajusta cursor inicial de conteúdo
  }

  private renderSectionTitle(doc: PDFKit.PDFDocument, title: string) {
    doc
      .fontSize(14)
      .fillColor(COLORS.primary)
      .text(title);
    doc.moveDown(0.5);
  }

  private renderSummaryCards(
    doc: PDFKit.PDFDocument,
    income: number,
    expenses: number,
    deposits: number,
    balance: number,
  ) {
    const startY = doc.y;
    const cardWidth = (doc.page.width - 80 - 30) / 4; // 4 cartões com espaçamento de 10px
    const cardHeight = 55;

    const items = [
      { label: 'Receitas', value: income, color: COLORS.success },
      { label: 'Despesas', value: expenses, color: COLORS.danger },
      { label: 'Depósitos', value: deposits, color: COLORS.secondary },
      { label: 'Saldo Total', value: balance, color: balance >= 0 ? COLORS.success : COLORS.danger },
    ];

    items.forEach((item, index) => {
      const x = 40 + index * (cardWidth + 10);

      // Card Background
      doc
        .roundedRect(x, startY, cardWidth, cardHeight, 6)
        .fillAndStroke(COLORS.background, COLORS.border);

      // Label
      doc
        .fontSize(9)
        .fillColor(COLORS.textMuted)
        .text(item.label, x + 8, startY + 8, { width: cardWidth - 16, align: 'left' });

      // Value
      doc
        .fontSize(11)
        .fillColor(item.color)
        .text(this.formatCurrency(item.value), x + 8, startY + 28, {
          width: cardWidth - 16,
          align: 'left',
        });
    });

    doc.y = startY + cardHeight + 10;
  }

  private drawBarChart(doc: PDFKit.PDFDocument, income: number, expenses: number) {
    const maxValue = Math.max(income, expenses, 1);
    const containerWidth = doc.page.width - 80;
    const startY = doc.y;
    const barHeight = 16;

    // Container do gráfico
    doc
      .roundedRect(40, startY, containerWidth, 85, 6)
      .fillAndStroke(COLORS.background, COLORS.border);

    // Receita Bar
    const incomeWidth = Math.max((income / maxValue) * (containerWidth - 160), 2);
    doc
      .fontSize(9)
      .fillColor(COLORS.text)
      .text('Receitas', 55, startY + 18, { width: 80 });

    doc
      .roundedRect(130, startY + 15, incomeWidth, barHeight, 4)
      .fill(COLORS.success);

    doc
      .fontSize(9)
      .fillColor(COLORS.text)
      .text(this.formatCurrency(income), 135 + incomeWidth, startY + 18);

    // Despesa Bar
    const expenseWidth = Math.max((expenses / maxValue) * (containerWidth - 160), 2);
    doc
      .fontSize(9)
      .fillColor(COLORS.text)
      .text('Despesas', 55, startY + 48, { width: 80 });

    doc
      .roundedRect(130, startY + 45, expenseWidth, barHeight, 4)
      .fill(COLORS.danger);

    doc
      .fontSize(9)
      .fillColor(COLORS.text)
      .text(this.formatCurrency(expenses), 135 + expenseWidth, startY + 48);

    doc.y = startY + 95;
  }

  private renderAnalysisBox(doc: PDFKit.PDFDocument, analysis: string[]) {
    const startY = doc.y;
    const width = doc.page.width - 80;

    let contentHeight = 16;
    analysis.forEach((item) => {
      contentHeight += doc.heightOfString(`• ${item}`, { width: width - 20 }) + 4;
    });

    doc
      .roundedRect(40, startY, width, contentHeight, 6)
      .fillAndStroke('#F0FDFA', '#CCFBF1'); // Highlight em tom Teal fraco

    let currentTextY = startY + 10;
    analysis.forEach((item) => {
      doc
        .fontSize(9.5)
        .fillColor(COLORS.text)
        .text(`• ${item}`, 50, currentTextY, { width: width - 20 });
      currentTextY += doc.heightOfString(`• ${item}`, { width: width - 20 }) + 4;
    });

    doc.y = startY + contentHeight + 10;
  }

  private renderCategoryTable(
    doc: PDFKit.PDFDocument,
    categories: { category: string; amount: number; percentage: number }[],
  ) {
    const startX = 40;
    const tableWidth = doc.page.width - 80;

    // Header da tabela
    let currentY = doc.y;
    doc
      .rect(startX, currentY, tableWidth, 20)
      .fill(COLORS.primary);

    doc
      .fontSize(9)
      .fillColor('#FFFFFF')
      .text('Categoria', startX + 10, currentY + 5)
      .text('Valor', startX + 250, currentY + 5, { width: 100, align: 'right' })
      .text('Porcentagem', startX + 370, currentY + 5, { width: 100, align: 'right' });

    currentY += 20;

    // Linhas
    categories.forEach((cat, index) => {
      this.checkPageBreak(doc, 25);

      const bg = index % 2 === 0 ? COLORS.cardBg : COLORS.background;
      doc.rect(startX, currentY, tableWidth, 22).fillAndStroke(bg, COLORS.border);

      doc
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(cat.category, startX + 10, currentY + 6)
        .text(this.formatCurrency(cat.amount), startX + 250, currentY + 6, {
          width: 100,
          align: 'right',
        })
        .text(`${cat.percentage.toFixed(1)}%`, startX + 370, currentY + 6, {
          width: 100,
          align: 'right',
        });

      currentY += 22;
    });

    doc.y = currentY + 10;
  }

  private renderTransactionsList(doc: PDFKit.PDFDocument, transactions: any[]) {
    const startX = 40;
    const tableWidth = doc.page.width - 80;

    let currentY = doc.y;

    // Header
    doc.rect(startX, currentY, tableWidth, 20).fill(COLORS.primary);
    doc
      .fontSize(9)
      .fillColor('#FFFFFF')
      .text('Data', startX + 10, currentY + 5)
      .text('Tipo', startX + 80, currentY + 5)
      .text('Descrição', startX + 160, currentY + 5)
      .text('Valor', startX + 370, currentY + 5, { width: 100, align: 'right' });

    currentY += 20;

    transactions.forEach((t, index) => {
      this.checkPageBreak(doc, 22);

      const bg = index % 2 === 0 ? COLORS.cardBg : COLORS.background;
      doc.rect(startX, currentY, tableWidth, 22).fillAndStroke(bg, COLORS.border);

      const dateStr = new Date(t.createdAt).toLocaleDateString('pt-BR');
      const amountColor = t.type === 'INCOME' || t.type === 'DEPOSIT' ? COLORS.success : COLORS.danger;

      doc
        .fontSize(8.5)
        .fillColor(COLORS.text)
        .text(dateStr, startX + 10, currentY + 6)
        .text(t.type, startX + 80, currentY + 6)
        .text(t.description || 'Sem descrição', startX + 160, currentY + 6, {
          width: 200,
          height: 12,
          ellipsis: true,
        })
        .fillColor(amountColor)
        .text(this.formatCurrency(Number(t.amount)), startX + 370, currentY + 6, {
          width: 100,
          align: 'right',
        });

      currentY += 22;
    });

    doc.y = currentY + 10;
  }

  private renderGoals(doc: PDFKit.PDFDocument, goals: any[]) {
    goals.forEach((goal) => {
      this.checkPageBreak(doc, 70);

      const startY = doc.y;
      const width = doc.page.width - 80;
      const targetAmount = Number(goal.targetAmount);
      const currentAmount = Number(goal.currentAmount);
      const progress = Math.min((currentAmount / targetAmount) * 100, 100);

      doc
        .roundedRect(40, startY, width, 60, 6)
        .fillAndStroke(COLORS.background, COLORS.border);

      doc
        .fontSize(10)
        .fillColor(COLORS.primary)
        .text(goal.name, 50, startY + 10);

      doc
        .fontSize(9)
        .fillColor(COLORS.textMuted)
        .text(
          `${this.formatCurrency(currentAmount)} de ${this.formatCurrency(targetAmount)} (${progress.toFixed(0)}%)`,
          50,
          startY + 24,
        );

      // Barra de progresso da meta
      const progressBarWidth = width - 20;
      doc
        .roundedRect(50, startY + 40, progressBarWidth, 8, 4)
        .fill(COLORS.border);

      if (progress > 0) {
        doc
          .roundedRect(50, startY + 40, (progressBarWidth * progress) / 100, 8, 4)
          .fill(COLORS.secondary);
      }

      doc.y = startY + 70;
    });
  }

  private checkPageBreak(doc: PDFKit.PDFDocument, requiredSpace: number) {
    const pageHeight = doc.page.height;
    const bottomMargin = doc.page.margins.bottom;

    if (doc.y + requiredSpace > pageHeight - bottomMargin) {
      doc.addPage();
      this.renderHeader(doc);
      return true;
    }

    return false;
  }

  private applyFooters(doc: PDFKit.PDFDocument) {
    const pages = doc.bufferedPageRange();

    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      doc
        .fontSize(8)
        .fillColor(COLORS.textMuted)
        .text(
          `Página ${i + 1} de ${pages.count}`,
          40,
          doc.page.height - 30,
          { align: 'center', width: doc.page.width - 80 },
        );
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  private generateFinancialAnalysis(
    income: number,
    expenses: number,
    balance: number,
    categorySummary: { category: string; amount: number; percentage: number }[],
  ): string[] {
    const analysis: string[] = [];

    if (income === 0 && expenses === 0) {
      analysis.push('Não foram identificadas movimentações financeiras no período analisado.');
      return analysis;
    }

    if (balance > 0) {
      analysis.push(`O período apresentou saldo positivo de ${this.formatCurrency(balance)}.`);
    } else if (balance < 0) {
      analysis.push(`O período apresentou saldo negativo de ${this.formatCurrency(Math.abs(balance))}.`);
    } else {
      analysis.push('O período apresentou equilíbrio entre receitas e despesas.');
    }

    if (expenses > 0 && categorySummary.length > 0) {
      const topCategory = categorySummary[0];
      analysis.push(
        `A categoria com maior volume de despesas foi "${topCategory.category}", representando ${topCategory.percentage.toFixed(2)}% das despesas totais.`,
      );
    }

    if (income > 0) {
      const expensePercentage = (expenses / income) * 100;
      analysis.push(
        `As despesas corresponderam a ${expensePercentage.toFixed(2)}% das receitas registradas no período.`,
      );
    }

    return analysis;
  }
}