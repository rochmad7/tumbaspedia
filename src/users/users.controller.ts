import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { ConstRole } from '../constants';
import { ErrorResponse, SuccessResponse } from '../app.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post(':id/upload')
  @Roles(ConstRole.ADMIN, ConstRole.SELLER, ConstRole.BUYER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('profile_picture'))
  async upload(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      await this.usersService.uploadImageToCloudinary(+id, file);
      return {
        message: 'Berhasil mengubah foto profil',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Gagal mengubah foto profil',
        errors: error,
      };
    }
  }

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const user = await this.usersService.create(createUserDto);
      return {
        message: 'User berhasil dibuat',
        data: user,
      };
    } catch (error) {
      return {
        message: 'User gagal dibuat',
        errors: error,
      };
    }
  }

  @Get()
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(): Promise<SuccessResponse | ErrorResponse> {
    try {
      const users = await this.usersService.findAll();
      return {
        message: 'Berhasil mengambil semua user',
        data: users,
      };
    } catch (error) {
      return {
        message: 'Gagal mengambil semua user',
        errors: error,
      };
    }
  }

  @Get('me')
  @Roles(ConstRole.ADMIN, ConstRole.SELLER, ConstRole.BUYER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMyProfile(
    @Req() req: any,
  ): Promise<SuccessResponse | ErrorResponse> {
    const user = await this.usersService.findOneById(req.user.id);

    if (!user) {
      return {
        message: 'User tidak ditemukan',
        errors: {
          message: 'User tidak ditemukan',
        },
      };
    }

    return {
      message: 'Berhasil mengambil user',
      data: user,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const user = await this.usersService.findOneById(+id);
      return {
        message: 'Berhasil mengambil user',
        data: user,
      };
    } catch (error) {
      return {
        message: 'Gagal mengambil user',
        errors: error,
      };
    }
  }

  @Patch('change-password')
  @Roles(ConstRole.ADMIN, ConstRole.SELLER, ConstRole.BUYER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async changePassword(
    @Body('old_password') oldPassword: string,
    @Body('new_password') newPassword: string,
    @Req() req: any,
  ): Promise<SuccessResponse | ErrorResponse> {
    const user = await this.usersService.findOneById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return {
        message: 'Password lama tidak sesuai',
        errors: {
          message: 'Password lama tidak sesuai',
        },
      };
    }

    try {
      await this.usersService.changePassword(+req.user.id, newPassword);
      return {
        message: 'Berhasil mengubah password',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Gagal mengubah password',
        errors: error,
      };
    }
  }

  @Patch(':id')
  @Roles(ConstRole.ADMIN, ConstRole.SELLER, ConstRole.BUYER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const user = await this.usersService.update(+id, updateUserDto);
      return {
        message: 'Berhasil mengubah user',
        data: user,
      };
    } catch (error) {
      return {
        message: 'Gagal mengubah user',
        errors: error,
      };
    }
  }

  @Delete(':id')
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(
    @Param('id') id: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      await this.usersService.remove(+id);
      return {
        message: 'Berhasil menghapus user',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Gagal menghapus user',
        errors: error,
      };
    }
  }

  @Post('upload-profile-picture')
  @Roles(ConstRole.ADMIN, ConstRole.SELLER, ConstRole.BUYER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('profile_picture'))
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      await this.usersService.uploadImageToCloudinary(req.user.id, file);
      return {
        message: 'Berhasil mengubah foto profil',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Gagal mengubah foto profil',
        errors: error,
      };
    }
  }
}
