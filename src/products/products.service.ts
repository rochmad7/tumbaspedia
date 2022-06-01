import {
  forwardRef,
  Inject,
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
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => ShopsService))
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
    sortBy: string,
    sortType: string,
    page: number,
    shopId: number,
    categoryId: number,
  ): Promise<Product[]> {
    if (page === undefined) {
      page = 0;
    }
    let whereQuery = '';

    if (search) {
      whereQuery = `LOWER(product.name) LIKE '%${search.toLowerCase()}%'`;
      if (shopId) {
        if (categoryId) {
          whereQuery += ` AND product.category_id = ${categoryId}`;
        }
        whereQuery += ` AND product.shop_id = ${shopId}`;
      }
      if (categoryId) {
        whereQuery += ` AND product.category_id = ${categoryId}`;
      }
    } else {
      if (shopId) {
        if (categoryId) {
          whereQuery += `product.category_id = ${categoryId} AND`;
        }
        whereQuery += ` product.shop_id = ${shopId}`;
      }
      if (categoryId) {
        whereQuery += ` AND product.category_id = ${categoryId}`;
      }
    }

    if (sortBy === 'date') {
      sortBy = 'product.created_at';
    }

    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.shop', 'shop', 'shop.id = product.shop_id')
      .leftJoinAndSelect(
        'product.category',
        'category',
        'category.id = product.category_id',
      )
      .leftJoinAndSelect('shop.user', 'user', 'user.id = shop.owner_id')
      .where(whereQuery)
      .orderBy(sortBy, sortType === 'asc' ? 'ASC' : 'DESC')
      .skip(page * 10)
      .getMany();
  }

  async findOne(id: number): Promise<Product> {
    return await this.productRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<void> {
    // const category = await this.categoriesService.findOne(
    //   updateProductDto.category_id,
    // );
    // if (!category) {
    //   throw new NotFoundException('Category not found');
    // }

    if (file) {
      const uploadImage = await this.cloudinaryService.uploadImage(
        file,
        CLOUDINARY_FOLDER_PRODUCT,
      );
      updateProductDto.product_picture = uploadImage.secure_url;
    }

    await this.productRepository
      .createQueryBuilder()
      .update(Product)
      .set({
        ...(updateProductDto.name && { name: updateProductDto.name }),
        ...(updateProductDto.description && {
          description: updateProductDto.description,
        }),
        ...(updateProductDto.price && { price: updateProductDto.price }),
        ...(updateProductDto.stock && { stock: updateProductDto.stock }),
        ...(updateProductDto.product_picture && {
          product_picture: updateProductDto.product_picture,
        }),
        ...(updateProductDto.category_id && {
          category_id: updateProductDto.category_id,
        }),
      })
      .where('id = :id', { id })
      .execute();
  }

  async remove(id: number): Promise<void> {
    const deleteProduct = await this.productRepository.softDelete(id);
    if (deleteProduct.affected === 0) {
      throw new NotFoundException('Product not found');
    }
  }

  async updateSold(id: number, sold: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const updateProduct = await this.productRepository.update(id, {
      sold: product.sold + sold,
    });
    if (updateProduct.affected === 0) {
      throw new NotFoundException('Product not found');
    }
  }
}
