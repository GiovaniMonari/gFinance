import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInternalReceiptDto } from './dto/create-internal-receipt.dto';

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
}