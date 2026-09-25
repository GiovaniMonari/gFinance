import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFinancialGoalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsNumber()
  @IsPositive()
  targetAmount!: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}