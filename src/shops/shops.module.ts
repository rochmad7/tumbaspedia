import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Shop } from './entities/shop.entity';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop]),
    MulterModule.register({
      storage: memoryStorage(), // use memory storage for having the buffer
    }),
    CloudinaryModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
