import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('product_pictures')
export class ProductPicture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { array: true })
  picture_urls: string[];

  @ManyToOne((type) => Product, (product) => product.product_pictures)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
