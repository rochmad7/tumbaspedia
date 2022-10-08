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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
        query['limit'],
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'shop_picture', maxCount: 1 },
      { name: 'shop_nib', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createShopDto: CreateShopDto,
    @Req() req,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const shop = await this.shopsService.create(req.user.id, createShopDto);
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
    let isVerified = true;
    if (query['is_verified'] === 'false') {
      isVerified = false;
    }

    try {
      const shops = await this.shopsService.findAll(
        query['search'],
        query['sort_by'],
        query['limit'],
        query['page'],
        isVerified,
      );
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

  @Roles(ConstRole.ADMIN, ConstRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'shop_picture', maxCount: 1 },
      { name: 'shop_nib', maxCount: 1 },
    ]),
  )
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDto,
    @UploadedFiles()
    files?: {
      shop_picture: Express.Multer.File[];
      shop_nib: Express.Multer.File[];
    },
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const user = await this.shopsService.update(+id, updateShopDto, files);
      return {
        message: 'Berhasil mengubah data toko',
        data: user,
      };
    } catch (error) {
      return {
        message: 'Gagal mengubah data toko',
        errors: error,
      };
    }
  }

  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('verify/:id')
  async verify(
    @Param('id') id: string,
    @Body('is_verified') isVerified: boolean,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const shop = await this.shopsService.verifyShop(+id, isVerified);
      return {
        message: 'Berhasil mengaktifkan toko',
        data: shop,
      };
    } catch (error) {
      return {
        message: 'Gagal mengaktifkan toko',
        errors: error,
      };
    }
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'shop_picture', maxCount: 1 },
      { name: 'shop_nib', maxCount: 1 },
    ]),
  )
  @Patch('upload-image/:id')
  async uploadImage(
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDto,
    @UploadedFiles()
    files?: {
      shop_picture: Express.Multer.File[];
      shop_nib: Express.Multer.File[];
    },
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      await this.shopsService.update(+id, updateShopDto, files);
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
