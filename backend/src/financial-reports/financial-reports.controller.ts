import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { FinancialReportsService } from './financial-reports.service';
import { FinancialReportQueryDto } from './dto/financial-report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import express from 'express';
import type { Request } from 'express';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@ApiTags('Financial Reports')
@ApiBearerAuth()
@Controller('financial-reports')
export class FinancialReportsController {
  constructor(
    private readonly financialReportsService: FinancialReportsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('pdf')
  @ApiOperation({
    summary: 'Gerar relatório financeiro em PDF',
    description:
      'Gera um relatório financeiro em PDF, podendo filtrar as movimentações por período.',
  })
  async generatePdf(
    @Req() req: AuthenticatedRequest,
    @Res() res: express.Response,
    @Query() query: FinancialReportQueryDto,
  ) {
    const pdf = await this.financialReportsService.generatePdf(
      req.user.id,
      query,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename="relatorio-financeiro.pdf"',
    });

    pdf.pipe(res);
    pdf.end();
  }
}