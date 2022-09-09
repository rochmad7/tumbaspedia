import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { ConstRole } from '../constants';
import { ErrorResponse, SuccessResponse } from '../app.service';
import { ResponseTransformInterceptor } from '../response-transformer.interceptor';

@Controller('categories')
@UseInterceptors(ResponseTransformInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll(@Query() query): Promise<SuccessResponse | ErrorResponse> {
    try {
      const categories = await this.categoriesService.findAll(query['limit']);
      return {
        message: 'Data kategori berhasil diambil',
        data: categories,
      };
    } catch (error) {
      return {
        message: 'Terjadi kesalahan pada server',
        errors: error,
      };
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const categories = await this.categoriesService.findOne(+id);
      return {
        message: 'Data kategori berhasil diambil',
        data: categories,
      };
    } catch (error) {
      return {
        message: 'Terjadi kesalahan pada server',
        errors: error,
      };
    }
  }

  @Patch(':id')
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      await this.categoriesService.update(+id, updateCategoryDto);
      return {
        message: 'Data kategori berhasil diubah',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Terjadi kesalahan pada server',
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
      const categories = await this.categoriesService.remove(+id);
      return {
        message: 'Data kategori berhasil dihapus',
        data: null,
      };
    } catch (error) {
      return {
        message: 'Terjadi kesalahan pada server',
        errors: error,
      };
    }
  }
}
