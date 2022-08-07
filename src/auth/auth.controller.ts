import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ErrorResponse, SuccessResponse } from '../app.service';
import { RegisterShopDto } from './dto/register-shop.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';

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

  @Get('/shop/confirm/:token')
  async confirmShop(
    @Param('token') token: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const confirm = await this.authService.confirmShop(token);
      return {
        message: 'Berhasil konfirmasi akun',
        data: confirm,
      };
    } catch (error) {
      return {
        message: 'Gagal konfirmasi akun',
        errors: error,
      };
    }
  }

  @Get('/confirm/:token')
  async confirmUser(
    @Param('token') token: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const confirm = await this.authService.confirmUser(token);
      return {
        message: 'Berhasil konfirmasi akun',
        data: confirm,
      };
    } catch (error) {
      return {
        message: 'Gagal konfirmasi akun',
        errors: error,
      };
    }
  }

  @Post('send-reset-password')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendResetPasswordEmail(
    @Body('email') email: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const sendResetPasswordEmail =
        await this.authService.sendResetPasswordEmail(email);
      return {
        message: 'Email berhasil dikirim',
        data: sendResetPasswordEmail,
      };
    } catch (error) {
      return {
        message: 'Terjadi kesalahan saat mengirim email',
        errors: error,
      };
    }
  }

  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const resetPassword = await this.authService.resetPassword(
        token,
        authCredentialsDto.password,
      );
      return {
        message: 'Berhasil konfirmasi akun',
        data: resetPassword,
      };
    } catch (error) {
      return {
        message: 'Gagal konfirmasi akun',
        errors: error,
      };
    }
  }

  @Post('login')
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

  @Post('admin/login')
  async loginAdmin(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const login = await this.authService.loginAdmin(authCredentialsDto);
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
  async loginShop(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const login = await this.authService.loginShop(authCredentialsDto);
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

  @Post('shop/register')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'shop_picture', maxCount: 1 },
      { name: 'shop_nib', maxCount: 1 },
    ]),
  )
  async registerShop(
    @Body() registerUserDto: RegisterUserDto,
    @Body('shop_name') shopName: string,
    @Body('shop_address') shopAddress: string,
    @Body('shop_description') shopDescription: string,
    @UploadedFiles()
    files: {
      shop_picture?: Express.Multer.File[];
      shop_nib?: Express.Multer.File[];
    },
  ): Promise<SuccessResponse | ErrorResponse> {
    const registerShopDto = new RegisterShopDto();
    registerShopDto.name = shopName;
    registerShopDto.address = shopAddress;
    registerShopDto.description = shopDescription;

    try {
      const registration = await this.authService.registerShop(
        registerUserDto,
        registerShopDto,
        // files,
      );
      return {
        message: 'Shop berhasil terdaftar',
        data: registration,
      };
    } catch (error) {
      return {
        message: 'Terjadi kesalahan saat pendaftaran',
        errors: error,
      };
    }
  }
}
