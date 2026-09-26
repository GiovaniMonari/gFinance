import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateFinancialGoalDto {
  @ApiProperty({
    example: 'Reserva de emergência',
    description: 'Nome da meta financeira',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 10000,
    description: 'Valor total que deseja atingir na meta',
  })
  @IsNumber()
  @IsPositive()
  targetAmount!: number;

  @ApiPropertyOptional({
    example: '2027-12-31',
    description: 'Data limite para atingir a meta',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}