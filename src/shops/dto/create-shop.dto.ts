import { IsNotEmpty } from 'class-validator';

export class CreateShopDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  address: string;

  shop_picture: string;

  is_open: boolean;

  is_verified: boolean;

  opened_at: string;

  closed_at: string;

  updated_at: Date;

  deleted_at: Date;
}
