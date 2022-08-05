import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UploadedFiles,
} from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import {
  CLOUDINARY_FOLDER_SHOP,
  CLOUDINARY_FOLDER_SHOP_NIB,
  ConstRole,
  DEFAULT_SHOP_PICTURE,
} from '../constants';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/entities/product.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
  ) {}

  async create(
    userId: number,
    createShopDto: CreateShopDto,
    // files: {
    //   shop_picture?: Express.Multer.File[];
    //   shop_nib?: Express.Multer.File[];
    // },
  ): Promise<Shop> {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // if (files.shop_picture) {
    //   console.log('I am here from flutter 2');
    //   const uploadShopPict = await this.cloudinaryService.uploadImage(
    //     files.shop_picture[0],
    //     CLOUDINARY_FOLDER_SHOP,
    //   );
    //   createShopDto.shop_picture = uploadShopPict.secure_url;
    // } else {
    //   console.log('I am here from flutter 3');
    //   createShopDto.shop_picture = DEFAULT_SHOP_PICTURE;
    //   console.log('default shop picture');
    // }
    //
    // if (files.shop_nib) {
    //   const uploadShopNib = await this.cloudinaryService.uploadImage(
    //     files.shop_nib[0],
    //     CLOUDINARY_FOLDER_SHOP_NIB,
    //   );
    //   createShopDto.nib = uploadShopNib.secure_url;
    // }

    try {
      // if (user.role.id == ConstRole.BUYER) {
      //   const role = await this.rolesService.findOne(ConstRole.SELLER);
      //
      //   await this.usersService.changeRole(userId, role);
      // }

      const shop = this.shopsRepository.create({
        ...createShopDto,
        shop_picture: DEFAULT_SHOP_PICTURE,
        // shop_picture: uploadShopPict.url,
        // nib: uploadShopNib.url,
        is_open: true,
        is_verified: false,
        user: user,
      });

      return await this.shopsRepository.save(shop);
    } catch (err) {
      // await this.cloudinaryService.deleteImage(uploadShopPict.public_id);
      // await this.cloudinaryService.deleteImage(uploadShopNib.public_id);
      throw new Error(err);
    }
  }

  async findAll(search: string, sortBy: string): Promise<Shop[]> {
    let shops: Shop[];
    if (search) {
      shops = await this.shopsRepository.find({
        where: {
          name: Like(`%${search}%`),
        },
        order: {
          [sortBy]: 'DESC',
        },
      });
    } else {
      shops = await this.shopsRepository.find({
        order: {
          [sortBy]: 'DESC',
        },
      });
    }

    for (const item of shops) {
      item.total_products = await this.productsService.countProductsByShop(
        item.id,
      );
    }

    return shops;
  }

  async findOne(id: number): Promise<Shop> {
    const shop = await this.shopsRepository.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    return shop;
  }

  async findOneByUserID(id: number): Promise<Shop> {
    const user = await this.usersService.findOneById(id);

    const shop = this.shopsRepository.findOne({ where: { user } });
    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    return shop;
  }

  async update(
    id: number,
    updateShopDto: UpdateShopDto,
    files?: {
      shop_picture?: Express.Multer.File[];
      shop_nib?: Express.Multer.File[];
    },
  ): Promise<void> {
    if (files.shop_picture !== undefined) {
      const uploadShopPict = await this.cloudinaryService.uploadImage(
        files.shop_picture[0],
        CLOUDINARY_FOLDER_SHOP,
      );

      updateShopDto.shop_picture = uploadShopPict.secure_url;
    }

    if (files.shop_nib !== undefined) {
      const uploadShopNib = await this.cloudinaryService.uploadImage(
        files.shop_nib[0],
        CLOUDINARY_FOLDER_SHOP_NIB,
      );

      updateShopDto.nib = uploadShopNib.secure_url;
    }

    const updateShop = await this.shopsRepository.update(id, {
      ...updateShopDto,
    });
    if (updateShop.affected === 0) {
      throw new NotFoundException(`Shop not found`);
    }
  }

  async remove(id: number): Promise<void> {
    const deleteShop = await this.shopsRepository.softDelete(id);
    if (deleteShop.affected === 0) {
      throw new NotFoundException(`Shop not found`);
    }
  }

  async findProducts(
    search: string,
    sortBy: string,
    sortType: string,
    page: number,
    limit: number,
    shopId: number,
    categoryId: number,
  ): Promise<Product[]> {
    const productShop = await this.productsService.findAll(
      search,
      sortBy,
      sortType,
      page,
      limit,
      shopId,
      categoryId,
    );
    if (!productShop) {
      throw new NotFoundException(`Products not found`);
    }

    return productShop;
  }

  async findTransactions(id: number): Promise<Transaction[]> {
    const transactionShop = await this.transactionsService.findAllByShopId(id);
    if (!transactionShop) {
      throw new NotFoundException(`Transactions not found`);
    }

    return transactionShop;
  }

  async verifyShop(id: number, isVerified: boolean): Promise<Shop> {
    const shop = await this.shopsRepository.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    const updateShop = await this.shopsRepository.update(id, {
      is_verified: isVerified,
    });
    if (updateShop.affected === 0) {
      throw new NotFoundException(`Shop not found`);
    }

    shop.is_verified = true;
    return shop;
  }
}
