import { IsNumber, IsPositive } from 'class-validator';

export class UpdateFinancialGoalProgressDto {
  @IsNumber()
  @IsPositive()
  amount!: number;
}