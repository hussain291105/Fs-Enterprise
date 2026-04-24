import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateStockDto {
  @IsNumber()
  gsm_number: number;

  @IsString()
  category: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsNumber()
  stock: number;

  @IsNumber()
  cost_price: number;

  @IsNumber()
  selling_price: number;

  @IsOptional()
  @IsNumber()
  kg?: number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  minimum_stock?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}
