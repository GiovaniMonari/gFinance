import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateInternalReceiptDto } from './dto/create-internal-receipt.dto';
import { UpdateReceiptProcessingDto } from './dto/update-receipt-processing.dto';
import { ReceiptsService } from './receipts.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('receipts')
export class ReceiptsController {
  constructor(
    private readonly receiptsService: ReceiptsService,
  ) {}

  @Post('internal')
  @UseGuards(JwtAuthGuard)
  async createInternal(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateInternalReceiptDto,
  ) {
    return this.receiptsService.createInternal(
      req.user.id,
      dto,
    );
  }

  @Patch('internal/:id/process')
  async processReceipt(
    @Param('id') id: string,
    @Body() dto: UpdateReceiptProcessingDto,
  ) {
    return this.receiptsService.processReceipt(
      id,
      dto,
    );
  }
}