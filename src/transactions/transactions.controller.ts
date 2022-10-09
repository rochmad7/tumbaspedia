import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { ConstRole } from '../constants';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { ErrorResponse, SuccessResponse } from '../app.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles(ConstRole.BUYER, ConstRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      createTransactionDto.user_id = req.user.id;
      const transaction = await this.transactionsService.create(
        createTransactionDto,
      );
      return {
        message: 'Transaksi berhasil dibuat',
        data: transaction,
      };
    } catch (error) {
      return {
        message: 'Transaksi gagal dibuat',
        errors: error,
      };
    }
  }

  @Get()
  @Roles(ConstRole.BUYER, ConstRole.SELLER, ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(
    @Req() req,
    @Query('search') search,
    @Query('status') status,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      if (req.user.role.id === ConstRole.ADMIN) {
        const transactions = await this.transactionsService.findAll(
          +search,
          status,
        );

        return {
          message: 'Transaksi berhasil ditemukan',
          data: transactions,
        };
      } else if (req.user.role.id === ConstRole.SELLER) {
        const transactions = await this.transactionsService.findAllByShopId(
          +req.user.shop.id,
        );

        return {
          message: 'Transaksi berhasil ditemukan',
          data: transactions,
        };
      } else {
        const transactions = await this.transactionsService.findAllByUserId(
          req.user.id,
        );

        return {
          message: 'Transaksi berhasil ditemukan',
          data: transactions,
        };
      }
    } catch (error) {
      return {
        message: 'Transaksi gagal ditemukan',
        errors: error,
      };
    }
  }

  @Get(':id')
  @Roles(ConstRole.BUYER, ConstRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(
    @Param('id') id: string,
    @Req() req,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const transaction = await this.transactionsService.findOne(
        +id,
        +req.user.id,
      );

      return {
        message: 'Transaksi berhasil ditemukan',
        data: transaction,
      };
    } catch (error) {
      return {
        message: 'Transaksi gagal ditemukan',
        errors: error,
      };
    }
  }

  @Patch(':id')
  @Roles(ConstRole.BUYER, ConstRole.SELLER, ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Req() req,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const transaction = await this.transactionsService.update(
        +id,
        updateTransactionDto,
      );

      return {
        message: 'Transaksi berhasil diubah',
        data: transaction,
      };
    } catch (error) {
      return {
        message: 'Transaksi gagal diubah',
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
      await this.transactionsService.remove(+id);

      return {
        message: 'Transaksi berhasil dihapus',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Transaksi gagal dihapus',
        errors: error,
      };
    }
  }
}
