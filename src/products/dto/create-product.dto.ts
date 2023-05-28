import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  product_picture: string;

  sold: number;

  @IsNotEmpty()
  // @Min(0)
  stock: number;

  @IsNotEmpty()
  // @Min(0)
  price: number;

  @IsNotEmpty()
  category_id: number;

  shop_id: number;

  old_category_id: number;

  promoted_at: Date;
}
