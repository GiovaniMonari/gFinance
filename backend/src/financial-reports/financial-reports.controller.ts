import {
  Controller,
  Get,
  Res,
  UseGuards,
} from '@nestjs/common';

import { FinancialReportsService } from './financial-reports.service';
import { Query } from '@nestjs/common';
import { FinancialReportQueryDto } from './dto/financial-report-query.dto';
import express from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request as NestRequest } from '@nestjs/common';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('financial-reports')
export class FinancialReportsController {
  constructor(
    private readonly financialReportsService: FinancialReportsService,
  ) {}

  @Get('pdf')
    async generatePdf(
    @NestRequest() req: AuthenticatedRequest,
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