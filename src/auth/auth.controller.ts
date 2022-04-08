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
import { ErrorResponse, SuccessResponse } from '../app.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const registration = await this.authService.register(registerUserDto);
      return {
        message: 'User berhasil terdaftar',
        data: registration,
      };
    } catch (error) {
      return {
        message: 'Terjadi kesalahan saat pendaftaran',
        errors: error,
      };
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const login = await this.authService.login(authCredentialsDto);
      return {
        message: 'Login berhasil',
        data: login,
      };
    } catch (error) {
      return {
        message: 'Terjadi kesalahan saat login',
        errors: error,
      };
    }
  }

  @Post('shop/login')
  @HttpCode(HttpStatus.OK)
  async shopLogin(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const login = this.authService.shopLogin(authCredentialsDto);
      return {
        message: 'Login berhasil',
        data: login,
      };
    } catch (error) {
      return {
        message: 'Terjadi kesalahan saat login',
        errors: error,
      };
    }
  }
}
