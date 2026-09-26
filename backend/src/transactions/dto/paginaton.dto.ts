import { Type } from 'class-transformer';
import {
  IsInt,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Número da página',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: 'Quantidade de registros por página',
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}