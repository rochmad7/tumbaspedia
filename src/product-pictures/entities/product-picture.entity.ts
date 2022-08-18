import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('product_pictures')
export class ProductPicture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  picture_url: string;

  @ManyToOne(() => Product, (product) => product.product_pictures)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;
}
