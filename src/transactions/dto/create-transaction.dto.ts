import { IsNotEmpty } from 'class-validator';

export class CreateTransactionDto {
  user_id: number;

  @IsNotEmpty()
  product_id: number;

  shop_id: number;

  @IsNotEmpty()
  quantity: number;

  total: number;

  status: string;

  delivered_at: Date;

  confirmed_at: Date;
}
