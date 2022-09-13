import { IsEmail, IsString, MinLength } from "class-validator";

export class AuthCredentialsDto {
  @IsString()
  @IsEmail()
  @MinLength(4)
  email: string;

  @IsString()
  @MinLength(6, {
    message: 'Password is too short',
  })
  password: string;
}
