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

  @Column()
  picture_url: string;

  @ManyToOne((type) => Product, (product) => product.product_pictures)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
