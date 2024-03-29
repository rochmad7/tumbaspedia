import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { QueryFailedError } from "typeorm";

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
  async confirmShop(@Param('token') token: string) {
    try {
      const confirm = await this.authService.confirmShop(token);
      return `<h1>Berhasil konfirmasi akun seller ${confirm.name}, silahkan login kembali di aplikasi</h1>`;
    } catch (error) {
      return '<h1>Gagal konfirmasi akun seller</h1>';
    }
  }

  @Get('/confirm/:token')
  async confirmUser(@Param('token') token: string) {
    try {
      const confirm = await this.authService.confirmUser(token);
      return `<h1>Berhasil konfirmasi akun ${confirm.name}, silahkan login kembali di aplikasi</h1>`;
    } catch (error) {
      return `<h1>Gagal konfirmasi akun</h1>`;
    }
  }

  @Post('send-reset-password')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendResetPasswordEmail(
    @Body('email') email: string,
    @Body('type') type: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const sendResetPasswordEmail =
        await this.authService.sendResetPasswordEmail(email, type);
      return {
        message: 'Email berhasil dikirim, silahkan cek email anda',
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
    @Body('new_password') newPassword: string,
    @Body('confirm_password') confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword) {
      return 'Kata sandi tidak sama. Silahkan coba lagi';
    }
    if (newPassword.length < 6) {
      return 'Kata sandi minimal 6 karakter. Silahkan coba lagi';
    }

    try {
      await this.authService.resetPassword(token, newPassword);
      return `<h1>Kata sandi berhasil diubah</h1>`;
    } catch (error) {
      return `<h1>Terjadi kesalahan saat mengubah kata sandi</h1>`;
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
    @Body('shop_nib_number') shopNIBNumber: string,
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
    registerShopDto.nib_number = shopNIBNumber;

    const isNIBAvailable = await this.authService.isNIBNumberAvailable(
      shopNIBNumber,
    );
    if (!isNIBAvailable) {
      return {
        message: 'NIB sudah digunakan',
        errors: {
          field: 'shop_nib_number',
          message: 'NIB sudah digunakan',
        },
      };
    }

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
