import { Injectable } from '@nestjs/common';
import { CreateProductPictureDto } from './dto/create-product-picture.dto';
import { UpdateProductPictureDto } from './dto/update-product-picture.dto';
import { ProductPicture } from './entities/product-picture.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CLOUDINARY_FOLDER_PRODUCT } from '../constants';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ProductPicturesService {
  constructor(
    @InjectRepository(ProductPicture)
    private readonly productPicturesRepository: Repository<ProductPicture>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly productsService: ProductsService,
  ) {}

  async create(
    createProductPictureDto: CreateProductPictureDto,
    files: {
      file1?: Express.Multer.File[];
      file2?: Express.Multer.File[];
      file3?: Express.Multer.File[];
    },
  ): Promise<ProductPicture> {
    const productPictures: string[] = [];

    const product = await this.productsService.findOne(
      createProductPictureDto.product_id,
    );

    if (files.file1) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        files.file1[0],
        CLOUDINARY_FOLDER_PRODUCT,
      );

      productPictures.push(uploadResult.secure_url);
    }

    if (files.file2) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        files.file2[0],
        CLOUDINARY_FOLDER_PRODUCT,
      );

      productPictures.push(uploadResult.secure_url);
    }

    if (files.file3) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        files.file3[0],
        CLOUDINARY_FOLDER_PRODUCT,
      );

      productPictures.push(uploadResult.secure_url);
    }

    const productPicture = this.productPicturesRepository.create({
      product,
      picture_urls: productPictures,
    });

    return await this.productPicturesRepository.save(productPicture);
  }

  findAll() {
    return `This action returns all productPictures`;
  }

  async findOneByProductId(productId: number): Promise<ProductPicture> {
    const product = await this.productsService.findOne(productId);

    return await this.productPicturesRepository.findOne({
      where: { product },
    });
  }

  update(id: number, updateProductPictureDto: UpdateProductPictureDto) {
    return `This action updates a #${id} productPicture`;
  }

  remove(id: number) {
    return `This action removes a #${id} productPicture`;
  }
}
