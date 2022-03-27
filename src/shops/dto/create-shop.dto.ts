import { IsNotEmpty } from 'class-validator';
import { User } from '../../users/entities/user.entity';

export class CreateShopDto {
  user: User;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  shop_picture: string;

  is_open: boolean;

  is_verified: boolean;

  opened_at: string;

  closed_at: string;

  updated_at: Date;

  deleted_at: Date;
}
