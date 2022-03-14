import { IsString, Matches, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  email: string;

  @IsString()
  @MinLength(6, {
    message: 'Password is too short',
  })
  password: string;
}
