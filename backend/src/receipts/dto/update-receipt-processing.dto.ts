import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReceiptProcessingDto {
  @IsOptional()
  @IsString()
  merchant?: string;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  items?: ReceiptItemDto[];
}

export class ReceiptItemDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  totalPrice?: number;
}