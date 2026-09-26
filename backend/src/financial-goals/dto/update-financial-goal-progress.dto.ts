import { IsNumber, IsPositive } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateFinancialGoalProgressDto {
  @ApiProperty({
    example: 500,
    description: 'Valor a ser adicionado ou removido da meta financeira',
  })
  @IsNumber()
  @IsPositive()
  amount!: number;
}