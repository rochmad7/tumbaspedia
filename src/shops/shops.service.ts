import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import {
  CLOUDINARY_FOLDER_SHOP,
  CLOUDINARY_FOLDER_SHOP_NIB,
  DEFAULT_SHOP_PICTURE,
} from '../constants';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/entities/product.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { Transaction } from '../transactions/entities/transaction.entity';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';

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
    private readonly mailService: MailService,
  ) {}

  async create(userId: number, createShopDto: CreateShopDto): Promise<Shop> {
    const user = await this.usersService.findOneByIdNotVerified(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const shop = this.shopsRepository.create({
        ...createShopDto,
        shop_picture: DEFAULT_SHOP_PICTURE,
        is_open: true,
        is_verified: false,
        user: user,
      });

      return await this.shopsRepository.save(shop);
    } catch (err) {
      throw new Error(err);
    }
  }

  async findAll(
    search: string,
    sortBy: string,
    limit: number,
    page: number,
    isVerified: boolean,
    sortType: string,
  ): Promise<Shop[]> {
    if (isNaN(page) || page === 0) {
      page = 1;
    }
    if (isNaN(limit)) {
      limit = 10;
    }

    let whereQuery = '';

    if (search) {
      whereQuery = `shop.name LIKE '%${search}%'`;
    }
    if (sortBy === 'date') {
      sortBy = 'created_at';
    }

    sortBy == undefined || sortBy == 'random'
      ? (sortBy = `rand()`)
      : (sortBy = `shop.${sortBy}`);

    let shops: Shop[];
    if (isVerified) {
      shops = await this.shopsRepository
        .createQueryBuilder('shop')
        .leftJoinAndSelect('shop.user', 'user')
        .leftJoinAndSelect('user.role', 'role')
        .where(whereQuery)
        .andWhere('shop.is_verified = true')
        .orderBy(sortBy, sortType === 'asc' ? 'ASC' : 'DESC')
        .offset((page - 1) * limit)
        .limit(limit)
        .getMany();

      for (const shop of shops) {
        shop.total_products = await this.productsService.countProductsByShop(
          shop.id,
        );
      }
    } else if (!isVerified) {
      shops = await this.shopsRepository
        .createQueryBuilder('shop')
        .leftJoinAndSelect('shop.user', 'user')
        .where(whereQuery)
        .orderBy(sortBy, sortType === 'asc' ? 'ASC' : 'DESC')
        .getMany();
    }

    return shops;
  }

  async findOne(id: number): Promise<Shop> {
    const shop = await this.shopsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    return shop;
  }

  async findOneByUserID(id: number): Promise<Shop> {
    const user = await this.usersService.findOneById(id);

    const shop = this.shopsRepository.findOne({
      where: { user },
      relations: ['user'],
    });
    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    return shop;
  }

  async update(
    id: number,
    updateShopDto: UpdateShopDto,
    files?: {
      shop_picture: Express.Multer.File[];
      shop_nib: Express.Multer.File[];
    },
  ): Promise<User> {
    if (files !== undefined) {
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
    }

    const updateShop = await this.shopsRepository.update(id, {
      ...updateShopDto,
    });
    if (updateShop.affected === 0) {
      throw new NotFoundException(`Shop not found`);
    }

    const shop = await this.shopsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    return await this.usersService.findOneById(shop.user.id);
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
      'seller',
      [],
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
    const shop = await this.shopsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    const updateShop = await this.shopsRepository.update(id, {
      is_verified: isVerified,
    });
    if (updateShop.affected === 0) {
      throw new NotFoundException(`Shop not found`);
    }

    if (isVerified) {
      shop.is_verified = true;
      await this.mailService.sendMailVerificationShop(shop);
    }

    return shop;
  }

  async findShopByNIBNumber(nib_number: string): Promise<Shop> {
    return await this.shopsRepository.findOne({
      where: { nib_number },
      relations: ['user'],
    });
  }
}
