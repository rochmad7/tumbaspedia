import { forwardRef, Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Shop } from './entities/shop.entity';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { ProductsModule } from '../products/products.module';
import { TransactionsModule } from "../transactions/transactions.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop]),
    MulterModule.register({
      storage: memoryStorage(), // use memory storage for having the buffer
    }),
    CloudinaryModule,
    UsersModule,
    forwardRef(() => ProductsModule),
    forwardRef(() => TransactionsModule),
    RolesModule,
  ],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {}
