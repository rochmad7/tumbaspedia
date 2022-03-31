import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Shop } from '../../shops/entities/shop.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column()
  total: number;

  @Column()
  status: string;

  @Column({ type: 'timestamp' })
  delivered_at: Date;

  @Column({ type: 'timestamp' })
  confirmed_at: Date;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;

  @ManyToOne((type) => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne((type) => Product, (product) => product.transactions)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne((type) => Shop, (shop) => shop.transactions)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;
}
