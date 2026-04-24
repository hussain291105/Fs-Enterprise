import { IsString, IsNumber } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  item: string;

  @IsNumber()
  qty: number;

  @IsNumber()
  amount: number;
}
