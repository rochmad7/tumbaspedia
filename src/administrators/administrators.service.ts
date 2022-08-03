import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ShopsService } from '../shops/shops.service';
import { CategoriesService } from '../categories/categories.service';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { Administrator } from './entities/administrator.entity';

@Injectable()
export class AdministratorsService {
  constructor(
    @InjectRepository(Administrator)
    private readonly shopsService: ShopsService,
    private readonly usersService: UsersService,
    private readonly transactionsService: TransactionsService, // private readonly usersService: UsersService,
  ) {}

  async findAllTransactionsCount(
    date: Date,
  ): Promise<{ monthly_transactions; weekly_transactions }> {
    const monthlyTransactions =
      await this.transactionsService.countAllTransactionsPerMonth(date);

    const weeklyTransactions =
      await this.transactionsService.countAllTransactionsPerWeek(date);

    return {
      monthly_transactions: monthlyTransactions,
      weekly_transactions: weeklyTransactions,
    };
  }

  async findAllUsersCount(): Promise<{ shops_count; buyers_count }> {
    const usersCount = await this.usersService.countUsers();

    return {
      shops_count: usersCount.shops_count,
      buyers_count: usersCount.buyers_count,
    };
  }

  async findTotalTransactions(
    date: Date,
  ): Promise<{ monthly_transactions: number; weekly_transactions: number }> {
    const monthlyTransactions =
      await this.transactionsService.totalAllTransactionsPerMonth(date);

    const weeklyTransactions =
      await this.transactionsService.totalAllTransactionsPerWeek(date);

    return {
      monthly_transactions: monthlyTransactions,
      weekly_transactions: weeklyTransactions,
    };
  }

  create(createAdministratorDto: CreateAdministratorDto) {
    return 'This action adds a new administrator';
  }

  findAll() {
    return `This action returns all administrators`;
  }

  findOne(id: number) {
    return `This action returns a #${id} administrator`;
  }

  update(id: number, updateAdministratorDto: UpdateAdministratorDto) {
    return `This action updates a #${id} administrator`;
  }

  remove(id: number) {
    return `This action removes a #${id} administrator`;
  }
}
