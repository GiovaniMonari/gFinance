import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFinancialGoalDto {
  @ApiPropertyOptional({
    example: 'Reserva de emergência',
    description: 'Novo nome da meta financeira',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 15000,
    description: 'Novo valor alvo da meta',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  targetAmount?: number;

  @ApiPropertyOptional({
    example: '2027-12-31',
    description: 'Nova data limite para atingir a meta',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}