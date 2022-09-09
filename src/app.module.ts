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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdministratorsModule } from './administrators/administrators.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: ['dist/src/**/entities/*.js'],
        migrationsTableName: 'migration_table',
        synchronize: false,
        logging: configService.get<string>('DB_LOGGING') === 'true',
        migrations: ['dist/database/migrations/*.js'],
      }),
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
    AdministratorsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
