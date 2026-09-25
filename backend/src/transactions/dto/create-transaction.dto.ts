import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  DEPOSIT = 'DEPOSIT',
}

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsEnum(TransactionType)
  transactionType!: TransactionType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}