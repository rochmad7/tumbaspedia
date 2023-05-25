import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdministratorsService } from './administrators.service';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { ConstRole } from '../constants';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { ErrorResponse, SuccessResponse } from '../app.service';

@Controller('admins')
export class AdministratorsController {
  constructor(private readonly administratorsService: AdministratorsService) {}

  @Get('users-report')
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findUsersReport(@Query('date') date: string) {
    try {
      const parseDate = new Date(date);
      if (isNaN(parseDate.getTime())) {
        return {
          message: 'Laporan user gagal didapatkan',
          errors: ['Tanggal tidak valid'],
        };
      }

      const report = await this.administratorsService.findUsersReport(
        parseDate,
      );
      return {
        message: 'Laporan user berhasil didapatkan',
        data: report,
      };
    } catch (error) {
      return {
        message: 'Laporan user gagal didapatkan',
        errors: error,
      };
    }
  }

  @Get('transactions-report')
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findTransactionsReport(@Query('date') date: string) {
    try {
      const parseDate = new Date(date);
      if (isNaN(parseDate.getTime())) {
        return {
          message: 'Laporan transaksi gagal didapatkan',
          errors: ['Tanggal tidak valid'],
        };
      }

      const report = await this.administratorsService.findTransactionsReport(
        parseDate,
      );
      return {
        message: 'Laporan transaksi berhasil didapatkan',
        data: report,
      };
    } catch (error) {
      return {
        message: 'Laporan transaksi gagal didapatkan',
        errors: error,
      };
    }
  }

  @Post()
  create(@Body() createAdministratorDto: CreateAdministratorDto) {
    return this.administratorsService.create(createAdministratorDto);
  }

  @Get()
  findAll() {
    return this.administratorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.administratorsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdministratorDto: UpdateAdministratorDto,
  ) {
    return this.administratorsService.update(+id, updateAdministratorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.administratorsService.remove(+id);
  }
}
