import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopsService } from '../shops/shops.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @Inject(forwardRef(() => ShopsService))
    private readonly shopsService: ShopsService,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly mailService: MailService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const user = await this.usersService.findOneById(
      createTransactionDto.user_id,
    );
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const product = await this.productsService.findOne(
      createTransactionDto.product_id,
    );
    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    if (product.shop.user.email === user.email) {
      throw new UnauthorizedException('Anda tidak bisa membeli produk sendiri');
    }

    const transaction = await this.transactionRepository.create({
      ...createTransactionDto,
      total: product.price * createTransactionDto.quantity,
      status: 'pending',
      shop: product.shop,
      user,
      product,
    });

    await this.productsService.update(createTransactionDto.product_id, {
      stock: product.stock - createTransactionDto.quantity,
    });

    const transactionSave = await this.transactionRepository.save(transaction);

    await this.mailService.sendShopOrderNotification(transaction);
    await this.mailService.sendUserOrderNotification(transaction);

    return transactionSave;
  }

  async findAll(search: number, status: string): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      relations: ['shop', 'user', 'product', 'product.category'],
      where: {
        ...(search && {
          id: search,
        }),
        ...(status && {
          status,
        }),
      },
      order: {
        created_at: 'DESC',
      },
      withDeleted: true,
    });
  }

  async findAllByUserId(userId: number): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: {
        created_at: 'DESC',
      },
      withDeleted: true,
      relations: ['shop', 'user', 'product', 'shop.user', 'product.category'],
    });
  }

  async findAllTransactionByShopId(userId: number): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      withDeleted: true,
      relations: ['shop', 'user', 'product'],
    });
  }

  async findOne(id: number, userId: number): Promise<Transaction> {
    return await this.transactionRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
      relations: ['shop', 'user', 'product', 'shop.user', 'product.category'],
    });
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    if (updateTransactionDto.status === 'delivered') {
      const updateTransaction = await this.transactionRepository.update(id, {
        status: updateTransactionDto.status,
        confirmed_at: new Date(),
      });
      if (updateTransaction.affected === 0) {
        throw new NotFoundException('Transaction not found');
      }

      const transaction = await this.findOne(id, updateTransactionDto.user_id);
      await this.productsService.updateSold(
        transaction.product.id,
        transaction.quantity,
      );

      return transaction;
    }

    const updateTransaction = await this.transactionRepository.update(
      id,
      updateTransactionDto,
    );
    if (updateTransaction.affected === 0) {
      throw new NotFoundException('Transaction not found');
    }

    return await this.findOne(id, updateTransactionDto.user_id);
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
      .offset(skip)
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
      withDeleted: true,
      relations: ['shop', 'user', 'product'],
      order: {
        created_at: 'DESC',
      },
      skip,
      take,
    });
  }

  async countAllTransactionsPerMonth(date: Date): Promise<number> {
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    return await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('created_at >= :after', {
        after: firstDayOfMonth,
      })
      .andWhere('created_at < :before', {
        before: lastDayOfMonth,
      })
      .getCount();
  }

  async countAllTransactionsPerWeek(date: Date): Promise<number> {
    const lastDayOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
    );
    const firstDayOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - 6,
    );
    return await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('created_at >= :after', {
        after: firstDayOfWeek,
      })
      .andWhere('created_at < :before', {
        before: lastDayOfWeek,
      })
      .getCount();
  }

  async totalAllTransactionsPerMonth(date: Date): Promise<number> {
    let total = 0;

    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthSum = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.total)', 'total')
      .where('created_at >= :after', {
        after: firstDayOfMonth,
      })
      .andWhere('created_at < :before', {
        before: lastDayOfMonth,
      })
      .getRawMany();

    monthSum.forEach((element) => {
      total += +element.total;
    });

    return total;
  }

  async totalAllTransactionsPerWeek(date: Date): Promise<number> {
    let total = 0;

    const lastDayOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
    );
    const firstDayOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - 6,
    );
    const weekSum = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.total)', 'total')
      .where('created_at >= :after', {
        after: firstDayOfWeek,
      })
      .andWhere('created_at < :before', {
        before: lastDayOfWeek,
      })
      .getRawMany();

    weekSum.forEach((element) => {
      total += +element.total;
    });

    return total;
  }
}
