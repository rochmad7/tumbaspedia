import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  register(@Body() registerUserDto: RegisterUserDto): Promise<void> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ access_token: string }> {
    return this.authService.login(authCredentialsDto);
  }

  @Post('shop/login')
  @HttpCode(HttpStatus.OK)
  shopLogin(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ access_token: string }> {
    return this.authService.shopLogin(authCredentialsDto);
  }
}
