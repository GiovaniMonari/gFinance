import { IsNumber, IsPositive } from 'class-validator';

export class CreateFinancialGoalTransactionDto {
  @IsNumber()
  @IsPositive()
  amount!: number;
}