import { Injectable, NotFoundException } from '@nestjs/common';
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
  ): Promise<void> {
    const product = await this.productsService.findOne(
      createProductPictureDto.product_id,
    );

    if (files.file1) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        files.file1[0],
        CLOUDINARY_FOLDER_PRODUCT,
      );

      const productPicture = this.productPicturesRepository.create({
        product,
        picture_url: uploadResult.secure_url,
      });

      await this.productPicturesRepository.save(productPicture);
    }

    if (files.file2) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        files.file2[0],
        CLOUDINARY_FOLDER_PRODUCT,
      );

      const productPicture = this.productPicturesRepository.create({
        product,
        picture_url: uploadResult.secure_url,
      });

      await this.productPicturesRepository.save(productPicture);
    }

    if (files.file3) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        files.file3[0],
        CLOUDINARY_FOLDER_PRODUCT,
      );

      const productPicture = this.productPicturesRepository.create({
        product,
        picture_url: uploadResult.secure_url,
      });

      await this.productPicturesRepository.save(productPicture);
    }
  }

  async findPicturesByProductId(productId: number): Promise<ProductPicture[]> {
    // const product = await this.productsService.findOne(productId);

    // console.log(product);
    // const productPictures = await this.productPicturesRepository.find({
    //   where: { product },
    // });
    //
    // console.log(productPictures);
    // return productPictures;

    return this.productPicturesRepository
      .createQueryBuilder('product_picture')
      .where('product_picture.product_id = :productId', { productId })
      .getMany();
  }

  update(id: number, updateProductPictureDto: UpdateProductPictureDto) {
    return `This action updates a #${id} productPicture`;
  }

  async remove(productId: number) {
    const product = await this.productsService.findOne(productId);

    const deletedProductPicture = await this.productPicturesRepository.update(
      { product },
      { deleted_at: new Date() },
    );
    if (deletedProductPicture.affected === 0) {
      throw new NotFoundException('Product picture not found');
    }
  }
}
