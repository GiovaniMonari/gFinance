import { IsNumber, IsPositive } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateFinancialGoalTransactionDto {
  @ApiProperty({
    example: 500,
    description: 'Valor da movimentação financeira da meta',
  })
  @IsNumber()
  @IsPositive()
  amount!: number;
}