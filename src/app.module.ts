import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from './categories/categories.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ShopsModule } from './shops/shops.module';
import { ProductsModule } from './products/products.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ProductPicturesModule } from './product-pictures/product-pictures.module';
import { DatabaseConfiguration } from "./database.config";

@Module({
  imports: [
    TypeOrmModule.forRoot({ timezone: 'Asia/Jakarta' }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfiguration,
    }),
    MulterModule.register({
      storage: memoryStorage(), // use memory storage for having the buffer
    }),
    CategoriesModule,
    RolesModule,
    UsersModule,
    AuthModule,
    CloudinaryModule,
    ShopsModule,
    ProductsModule,
    TransactionsModule,
    ProductPicturesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
