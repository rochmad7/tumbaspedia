import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConstRole } from '../constants';
import { ErrorResponse, SuccessResponse } from '../app.service';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Roles(ConstRole.ADMIN, ConstRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/my-products')
  async findProducts(
    @Req() req,
    @Query() query,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const products = await this.shopsService.findProducts(
        query['search'],
        query['sortBy'],
        query['sortType'],
        query['page'],
        +req.user.shop.id,
        query['category'],
      );
      return {
        message: 'Berhasil mengambil semua produk',
        data: products,
      };
    } catch (error) {
      return {
        message: 'Gagal mengambil semua produk',
        errors: error,
      };
    }
  }

  @Roles(ConstRole.ADMIN, ConstRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/transactions')
  async findTransactions(@Req() req): Promise<SuccessResponse | ErrorResponse> {
    try {
      const transactions = await this.shopsService.findTransactions(
        +req.user.shop.id,
      );
      return {
        message: 'Berhasil mengambil semua transaksi',
        data: transactions,
      };
    } catch (error) {
      return {
        message: 'Gagal mengambil semua transaksi',
        errors: error,
      };
    }
  }

  @Post()
  @Roles(ConstRole.ADMIN, ConstRole.SELLER, ConstRole.BUYER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('shop_picture'))
  async create(
    @Body() createShopDto: CreateShopDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const shop = await this.shopsService.create(
        req.user.id,
        createShopDto,
        file,
      );
      return {
        message: 'Toko berhasil dibuat',
        data: shop,
      };
    } catch (error) {
      return {
        message: 'Toko gagal dibuat',
        errors: error,
      };
    }
  }

  @Get()
  async findAll(@Query() query): Promise<SuccessResponse | ErrorResponse> {
    try {
      const shops = await this.shopsService.findAll(query['search']);
      return {
        message: 'Berhasil mengambil semua toko',
        data: shops,
      };
    } catch (error) {
      return {
        message: 'Gagal mengambil semua toko',
        errors: error,
      };
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const shop = await this.shopsService.findOne(+id);
      return {
        message: 'Berhasil mengambil toko',
        data: shop,
      };
    } catch (error) {
      return {
        message: 'Gagal mengambil toko',
        errors: error,
      };
    }
  }

  @Roles(ConstRole.ADMIN, ConstRole.SELLER, ConstRole.BUYER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('shop_picture'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      await this.shopsService.update(+id, updateShopDto, file);
      return {
        message: 'Berhasil mengubah toko',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Gagal mengubah toko',
        errors: error,
      };
    }
  }

  @Roles(ConstRole.ADMIN, ConstRole.SELLER, ConstRole.BUYER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      await this.shopsService.remove(+id);
      return {
        message: 'Berhasil menghapus toko',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Gagal menghapus toko',
        errors: error,
      };
    }
  }
}
