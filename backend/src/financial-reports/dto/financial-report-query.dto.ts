import { IsDateString, IsOptional } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class FinancialReportQueryDto {
  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Data inicial do período do relatório',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-30',
    description: 'Data final do período do relatório',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}