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

  async findUsersReport(date: Date): Promise<{
    total_shops_count;
    total_buyers_count;
    monthly_shops_count;
    monthly_buyers_count;
  }> {
    const usersCount = await this.usersService.countUsers(date);

    return {
      total_shops_count: usersCount.total_shops_count,
      total_buyers_count: usersCount.total_buyers_count,
      monthly_shops_count: usersCount.monthly_shops_count,
      monthly_buyers_count: usersCount.monthly_buyers_count,
    };
  }

  async findTransactionsReport(date: Date): Promise<{
    monthly_total_transactions: number;
    yearly_total_transactions: number;
    monthly_count_transactions: number;
    yearly_count_transactions: number;
  }> {
    const monthlyTotalTransactions =
      await this.transactionsService.totalAllTransactionsPerMonth(date);

    // const weeklyTotalTransactions =
    //   await this.transactionsService.totalAllTransactionsPerWeek(date);

    const monthlyCountTransactions =
      await this.transactionsService.countAllTransactionsPerMonth(date);

    // const weeklyCountTransactions =
    //   await this.transactionsService.countAllTransactionsPerWeek(date);

    const yearlyTotalTransactions =
      await this.transactionsService.totalAllTransactionsPerYear(date);

    const yearlyCountTransactions =
      await this.transactionsService.countAllTransactionsPerYear(date);

    return {
      monthly_total_transactions: monthlyTotalTransactions,
      yearly_total_transactions: yearlyTotalTransactions,
      monthly_count_transactions: monthlyCountTransactions,
      yearly_count_transactions: yearlyCountTransactions,
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
