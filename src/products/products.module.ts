import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UsersModule } from '../users/users.module';
import { ShopsModule } from '../shops/shops.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CloudinaryModule,
    UsersModule,
    ShopsModule,
    CategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
