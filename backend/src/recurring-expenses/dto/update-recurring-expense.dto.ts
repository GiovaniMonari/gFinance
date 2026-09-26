import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRecurringExpenseDto {
  @ApiPropertyOptional({
    example: 250.5,
    description: 'Novo valor da despesa recorrente',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({
    example: 'Internet',
    description: 'Nova descrição da despesa recorrente',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  description?: string;

  @ApiPropertyOptional({
    example: 'clx123456789',
    description: 'ID da categoria associada à despesa',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 15,
    description: 'Novo dia do mês para execução da despesa',
    minimum: 1,
    maximum: 31,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Define se a despesa recorrente está ativa',
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}