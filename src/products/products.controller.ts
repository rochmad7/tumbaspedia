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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { ConstRole } from '../constants';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(ConstRole.ADMIN, ConstRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('product_picture'))
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    createProductDto.shop_id = req.shop_id;
    return this.productsService.create(createProductDto, file);
  }

  @Get()
  findAll(@Query() query) {
    return this.productsService.findAll(
      query['keyword'],
      query['order-by'],
      query['page'],
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
