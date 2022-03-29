import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, UpdateResult } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ShopsService } from '../shops/shops.service';
import { CategoriesService } from '../categories/categories.service';
import { UsersService } from '../users/users.service';

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
    shopId: number,
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
  ): Promise<Product> {
    const shop = await this.shopsService.findOne(shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const category = await this.categoriesService.findOne(
      createProductDto.category_id,
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const uploadImage = await this.cloudinaryService.uploadImage(file);

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
    keyword: string,
    orderBy: string,
    page: number,
  ): Promise<Product[]> {
    if (keyword) {
      if (orderBy) {
        return await this.productRepository.find({
          where: {
            name: Like(`%${keyword}%`),
          },
          order: {
            [orderBy]: 'DESC',
          },
          skip: page * 10,
        });
      }

      return await this.productRepository.find({
        where: {
          name: Like(`%${keyword}%`),
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

    return this.productRepository.find({
      skip: page * 10,
    });
  }

  async findOne(id: number): Promise<Product> {
    return await this.productRepository.findOne(id);
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<UpdateResult> {
    const updateProduct = await this.productRepository.update(id, {
      ...updateProductDto,
      updated_at: new Date(),
    });
    if (updateProduct.affected === 0) {
      throw new NotFoundException('Product not found');
    }

    return updateProduct;
  }

  async remove(id: number): Promise<UpdateResult> {
    const deleteProduct = await this.productRepository.update(id, {
      deleted_at: new Date(),
    });
    if (deleteProduct.affected === 0) {
      throw new NotFoundException('Product not found');
    }

    return deleteProduct;
  }
}
