import { IsString, IsNumber, IsArray, IsOptional, IsDateString } from 'class-validator';

export class CreateBillItemDto {
  @IsNumber()
  gsm_number: number;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  total: number;
}

export class CreateBillDto {
  @IsString()
  customer_name: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsString()
  payment_mode: string;

  @IsString()
  status: string;

  @IsDateString()
  bill_date: string;

  @IsArray()
  items: CreateBillItemDto[];

  @IsNumber()
  subtotal: number;
}
