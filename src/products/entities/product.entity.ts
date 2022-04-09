import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  product_picture: string;

  @Column()
  stock: number;

  @Column()
  price: number;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;

  @ManyToOne((type) => Category, (category) => category.products, {
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne((type) => Shop, (shop) => shop.products, { eager: true })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @OneToMany((type) => Transaction, (transaction) => transaction.product)
  transactions: Transaction[];
}
