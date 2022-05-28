import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopsService } from '../shops/shops.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @Inject(forwardRef(() => ShopsService))
    private readonly shopsService: ShopsService,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const shop = await this.shopsService.findOne(createTransactionDto.shop_id);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const user = await this.usersService.findOneById(
      createTransactionDto.user_id,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const product = await this.productsService.findOne(
      createTransactionDto.product_id,
    );

    const transaction = await this.transactionRepository.create({
      ...createTransactionDto,
      status: 'pending',
      shop,
      user,
      product,
    });

    await this.productsService.update(createTransactionDto.product_id, {
      stock: product.stock - createTransactionDto.quantity,
    });

    return await this.transactionRepository.save(transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      relations: ['shop', 'user', 'product'],
    });
  }

  async findAllByUserId(userId: number): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['shop', 'user', 'product'],
    });
  }

  async findOne(id: number, userId: number): Promise<Transaction> {
    return await this.transactionRepository.findOne(id, {
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['shop', 'user', 'product'],
    });
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<void> {
    const updateTransaction = await this.transactionRepository.update(
      id,
      updateTransactionDto,
    );
    if (updateTransaction.affected === 0) {
      throw new NotFoundException('Transaction not found');
    }

    if (updateTransactionDto.status === 'completed') {
      const transaction = await this.findOne(id, updateTransactionDto.user_id);
      await this.productsService.updateSold(
        transaction.product.id,
        transaction.quantity,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const transaction = await this.transactionRepository.softDelete(id);
    if (transaction.affected === 0) {
      throw new NotFoundException('Transaction not found');
    }
  }

  async findBestSeller(skip: number, take: number) {
    return this.transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.product_id')
      .addSelect('COUNT(transaction.product_id)', 'total')
      .groupBy('transaction.product_id')
      .orderBy('total', 'DESC')
      .limit(take)
      .skip(skip)
      .getRawMany();
  }

  async findAllByShopId(shopId: number, skip?: number, take?: number) {
    // return this.transactionRepository
    //   .createQueryBuilder('transaction')
    //   .where('transaction.shop_id = :shopId', { shopId })
    //   .orderBy('transaction.created_at', 'DESC')
    //   .skip(skip)
    //   .take(take)
    //   .getMany();

    return await this.transactionRepository.find({
      where: {
        shop: {
          id: shopId,
        },
      },
      relations: ['shop', 'user', 'product'],
      order: {
        created_at: 'DESC',
      },
      skip,
      take,
    });
  }
}
