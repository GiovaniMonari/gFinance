import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInternalReceiptDto } from './dto/create-internal-receipt.dto';
import { UpdateReceiptProcessingDto } from './dto/update-receipt-processing.dto';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  async createInternal(
    userId: string,
    dto: CreateInternalReceiptDto,
  ) {
    const finance = await this.prisma.finance.findUnique({
      where: {
        userId,
      },
    });

    if (!finance) {
      throw new NotFoundException('Finance not found');
    }

    const receipt = await this.prisma.receipt.create({
      data: {
        financeId: finance.id,
        imageUrl: dto.imageUrl,
        status: 'PROCESSING',
      },
    });

    return {
      id: receipt.id,
      status: receipt.status,
    };
  }

  async processReceipt(
    receiptId: string,
    dto: UpdateReceiptProcessingDto,
  ) {
    const receipt = await this.prisma.receipt.findUnique({
      where: {
        id: receiptId,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    const updatedReceipt = await this.prisma.receipt.update({
      where: {
        id: receiptId,
      },
      data: {
        merchant: dto.merchant,
        total: dto.total,
        date: dto.date ? new Date(dto.date) : undefined,
        status: 'PENDING_CONFIRMATION',
      },
    });

    if (dto.items) {
    await this.prisma.receiptItem.deleteMany({
      where: {
        receiptId,
      },
    });

    if (dto.items.length > 0) {
      await this.prisma.receiptItem.createMany({
        data: dto.items.map((item) => ({
          receiptId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      });
    }
  }

    return this.prisma.receipt.findUnique({
      where: {
        id: receiptId,
      },
      include: {
        items: true,
      },
    });
  }
}