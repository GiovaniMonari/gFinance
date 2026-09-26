import {
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

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateRecurringExpenseDto {
  @ApiProperty({
    example: 250.5,
    description: 'Valor da despesa recorrente',
  })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({
    example: 'Internet',
    description: 'Descrição da despesa recorrente',
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

  @ApiProperty({
    example: 10,
    description: 'Dia do mês em que a despesa será executada',
    minimum: 1,
    maximum: 31,
  })
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth!: number;
}