import { IsNumber, IsPositive } from 'class-validator';

export class UpdateMonthlyIncomeDto {
  @IsNumber()
  @IsPositive()
  monthlyIncome!: number;
}