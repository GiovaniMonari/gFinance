import { IsDateString, IsOptional } from 'class-validator';

export class FinancialReportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}