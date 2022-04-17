import { Module } from '@nestjs/common';
import { ProductPicturesService } from './product-pictures.service';
import { ProductPicturesController } from './product-pictures.controller';
import { ProductPicture } from './entities/product-picture.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductPicture]),
    CloudinaryModule,
    ProductsModule,
  ],
  controllers: [ProductPicturesController],
  providers: [ProductPicturesService],
})
export class ProductPicturesModule {}
