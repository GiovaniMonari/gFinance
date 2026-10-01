import { IsString } from 'class-validator';

export class CreateInternalReceiptDto {
  @IsString()
  imageUrl!: string;
}