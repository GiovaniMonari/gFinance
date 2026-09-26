import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  DEPOSIT = 'DEPOSIT',
}

export class CreateTransactionDto {
  @ApiProperty({
    example: 150.5,
    description: 'Valor da transação',
  })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.EXPENSE,
    description: 'Tipo da transação',
  })
  @IsEnum(TransactionType)
  transactionType!: TransactionType;

  @ApiPropertyOptional({
    example: 'Compra no supermercado',
    description: 'Descrição da transação',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'clx123456789',
    description: 'ID da categoria associada à transação',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;
}