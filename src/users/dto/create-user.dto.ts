import { IsNotEmpty, IsString } from 'class-validator';
import { Roles } from '../user.constant';

export class CreateUserDto {
  role_id = Roles.BUYER;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  profile_picture: string;
}
