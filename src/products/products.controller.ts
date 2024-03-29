import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { ConstRole } from '../constants';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ErrorResponse, SuccessResponse } from '../app.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(ConstRole.ADMIN, ConstRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('product_picture'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const product = await this.productsService.create(createProductDto, file);
      return {
        message: 'Produk berhasil dibuat',
        data: product,
      };
    } catch (error) {
      return {
        message: 'Produk gagal dibuat',
        errors: error,
      };
    }
  }

  @Get()
  async findAll(@Query() query): Promise<SuccessResponse | ErrorResponse> {
    try {
      const products = await this.productsService.findAll(
        query['search'],
        query['sortBy'],
        query['sortType'],
        +query['page'],
        +query['limit'],
        +query['shop'],
        +query['category'],
        query['userRole'],
        query['excludeIds'] ? query['excludeIds'].split(',') : [],
      );
      if (products.length === 0) {
        return {
          message: 'Produk tidak ditemukan',
          data: products,
        };
      }
      return {
        message: 'Produk berhasil ditemukan',
        data: products,
      };
    } catch (error) {
      return {
        message: 'Produk gagal ditemukan',
        errors: error,
      };
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const product = await this.productsService.findOne(+id);
      return {
        message: 'Produk berhasil ditemukan',
        data: product,
      };
    } catch (error) {
      return {
        message: 'Produk gagal ditemukan',
        errors: error,
      };
    }
  }

  @Patch(':id')
  @Roles(ConstRole.ADMIN, ConstRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('product_picture'))
  async update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SuccessResponse | ErrorResponse> {
    const productOwned = await this.productsService.findOne(+id);
    if (
      req.user.role.id !== ConstRole.ADMIN &&
      productOwned.shop.id !== req.user.shop.id
    ) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    try {
      await this.productsService.update(+id, updateProductDto, file);
      return {
        message: 'Produk berhasil diubah',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Produk gagal diubah',
        errors: error,
      };
    }
  }

  @Patch(':id/promote')
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async promote(
    @Param('id') id: string,
    @Req() req,
    @Body('is_promoted') isPromoted: boolean,
  ): Promise<SuccessResponse | ErrorResponse> {
    const product = await this.productsService.findOne(+id);
    if (product === undefined) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    try {
      const updateDto = new UpdateProductDto();
      if (isPromoted) {
        updateDto.category_id = 1;
        updateDto.old_category_id = product.category.id;
        updateDto.promoted_at = new Date();
      } else {
        updateDto.category_id = product.old_category_id;
        updateDto.promoted_at = null;
      }

      await this.productsService.update(+id, updateDto);
      return {
        message: 'Produk berhasil diubah',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Produk gagal diubah',
        errors: error,
      };
    }
  }

  @Delete(':id')
  @Roles(ConstRole.ADMIN, ConstRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('product_picture'))
  async remove(
    @Param('id') id: string,
    @Req() req,
  ): Promise<SuccessResponse | ErrorResponse> {
    const productOwned = await this.productsService.findOne(+id);
    if (productOwned.shop.id !== req.user.shop.id) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    try {
      await this.productsService.remove(+id);
      return {
        message: 'Produk berhasil dihapus',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Produk gagal dihapus',
        errors: error,
      };
    }
  }
}
