import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ShopsService } from '../shops/shops.service';
import { CategoriesService } from '../categories/categories.service';
import { UsersService } from '../users/users.service';
import { CLOUDINARY_FOLDER_PRODUCT } from '../constants';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly shopsService: ShopsService,
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
  ): Promise<Product> {
    const shop = await this.shopsService.findOne(createProductDto.shop_id);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const category = await this.categoriesService.findOne(
      createProductDto.category_id,
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const uploadImage = await this.cloudinaryService.uploadImage(
      file,
      CLOUDINARY_FOLDER_PRODUCT,
    );

    try {
      const product = this.productRepository.create({
        ...createProductDto,
        product_picture: uploadImage.secure_url,
        stock: Number(createProductDto.stock),
        price: Number(createProductDto.price),
        shop,
        category,
      });
      return await this.productRepository.save(product);
    } catch (error) {
      await this.cloudinaryService.deleteImage(uploadImage.public_id);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async findAll(
    search: string,
    orderBy: string,
    page: number,
    shopId: number,
    categoryId: number,
  ): Promise<Product[]> {
    if (search) {
      if (orderBy) {
        return await this.productRepository.find({
          where: {
            name: Like(`%${search}%`),
          },
          order: {
            [orderBy]: 'DESC',
          },
          skip: page * 10,
        });
      }

      return await this.productRepository.find({
        where: {
          name: Like(`%${search}%`),
        },
        skip: page * 10,
      });
    }

    if (orderBy) {
      return await this.productRepository.find({
        order: {
          [orderBy]: 'DESC',
        },
        skip: page * 10,
      });
    }

    if (shopId) {
      const shop = await this.shopsService.findOne(shopId);

      return await this.productRepository.find({
        where: {
          shop,
        },
        skip: page * 10,
      });
    }

    if (categoryId) {
      const category = await this.categoriesService.findOne(categoryId);

      return await this.productRepository.find({
        where: {
          category,
        },
        skip: page * 10,
      });
    }

    return await this.productRepository.find({
      skip: page * 10,
    });
  }

  async findOne(id: number): Promise<Product> {
    return await this.productRepository.findOne({ where: { id } });
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<void> {
    const updateProduct = await this.productRepository.update(id, {
      ...updateProductDto,
    });
    if (updateProduct.affected === 0) {
      throw new NotFoundException('Product not found');
    }
  }

  async remove(id: number): Promise<void> {
    const deleteProduct = await this.productRepository.softDelete(id);
    if (deleteProduct.affected === 0) {
      throw new NotFoundException('Product not found');
    }
  }
}
