import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ProductPicturesService } from './product-pictures.service';
import { CreateProductPictureDto } from './dto/create-product-picture.dto';
import { UpdateProductPictureDto } from './dto/update-product-picture.dto';
import { ErrorResponse, SuccessResponse } from '../app.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('product-pictures')
export class ProductPicturesController {
  constructor(
    private readonly productPicturesService: ProductPicturesService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file1', maxCount: 1 },
      { name: 'file2', maxCount: 1 },
      { name: 'file3', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createProductPictureDto: CreateProductPictureDto,
    @UploadedFiles()
    files: {
      file1?: Express.Multer.File[];
      file2?: Express.Multer.File[];
      file3?: Express.Multer.File[];
    },
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const productPicture = await this.productPicturesService.create(
        createProductPictureDto,
        files,
      );
      return {
        data: productPicture,
        message: 'Product picture created successfully',
      };
    } catch (error) {
      return {
        errors: error,
        message: 'Product picture creation failed',
      };
    }
  }

  @Get()
  findAll() {
    return this.productPicturesService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const productPicture =
        await this.productPicturesService.findPicturesByProductId(+id);
      return {
        data: productPicture,
        message: 'Product picture found successfully',
      };
    } catch (error) {
      return {
        errors: error,
        message: 'Product picture not found',
      };
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductPictureDto: UpdateProductPictureDto,
  ) {
    return this.productPicturesService.update(+id, updateProductPictureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productPicturesService.remove(+id);
  }
}
