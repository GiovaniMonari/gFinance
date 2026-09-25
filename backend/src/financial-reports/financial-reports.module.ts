import { Module } from '@nestjs/common';
import { FinancialReportsController } from './financial-reports.controller';
import { FinancialReportsService } from './financial-reports.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FinancialReportsController],
  providers: [
    FinancialReportsService,
    PrismaService,
  ],
})
export class FinancialReportsModule {}