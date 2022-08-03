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

  @Get('count-transactions')
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAllTransactionsCount(
    @Query('date') date: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const parseDate = new Date(date);
      if (isNaN(parseDate.getTime())) {
        return {
          message: 'Jumlah transaksi gagal didapatkan',
          errors: ['Tanggal tidak valid'],
        };
      }

      const count = await this.administratorsService.findAllTransactionsCount(
        parseDate,
      );
      return {
        message: 'Jumlah transaksi berhasil didapatkan',
        data: count,
      };
    } catch (error) {
      return {
        message: 'Jumlah transaksi gagal didapatkan',
        errors: error,
      };
    }
  }

  @Get('count-users')
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAllUsersCount() {
    try {
      const count = await this.administratorsService.findAllUsersCount();
      return {
        message: 'Jumlah user berhasil didapatkan',
        data: count,
      };
    } catch (error) {
      return {
        message: 'Jumlah user gagal didapatkan',
        errors: error,
      };
    }
  }

  @Get('total-transactions')
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findTotalTransactions(@Query('date') date: string) {
    try {
      const parseDate = new Date(date);
      if (isNaN(parseDate.getTime())) {
        return {
          message: 'Total transaksi gagal didapatkan',
          errors: ['Tanggal tidak valid'],
        };
      }

      const count = await this.administratorsService.findTotalTransactions(
        parseDate,
      );
      return {
        message: 'Total transaksi berhasil didapatkan',
        data: count,
      };
    } catch (error) {
      return {
        message: 'Total transaksi gagal didapatkan',
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
