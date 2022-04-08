import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { ConstRole } from '../constants';
import { ErrorResponse, SuccessResponse } from '../app.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const role = this.rolesService.create(createRoleDto);
      return {
        message: 'Role berhasil dibuat',
        data: role,
      };
    } catch (error) {
      return {
        message: 'Role gagal dibuat',
        errors: error,
      };
    }
  }

  @Get()
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(): Promise<SuccessResponse | ErrorResponse> {
    try {
      const roles = await this.rolesService.findAll();
      return {
        message: 'Berhasil mengambil semua role',
        data: roles,
      };
    } catch (error) {
      return {
        message: 'Gagal mengambil semua role',
        errors: error,
      };
    }
  }

  @Get(':id')
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const role = await this.rolesService.findOne(+id);
      return {
        message: 'Berhasil mengambil role',
        data: role,
      };
    } catch (error) {
      return {
        message: 'Gagal mengambil role',
        errors: error,
      };
    }
  }

  @Patch(':id')
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const role = await this.rolesService.update(+id, updateRoleDto);
      return {
        message: 'Berhasil mengubah role',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Gagal mengubah role',
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
      await this.rolesService.remove(+id);
      return {
        message: 'Berhasil menghapus role',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Gagal menghapus role',
        errors: error,
      };
    }
  }
}
