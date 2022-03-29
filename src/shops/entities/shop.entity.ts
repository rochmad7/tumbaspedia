import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  shop_picture: string;

  @Column()
  is_open: boolean;

  @Column({ default: false })
  is_verified: boolean;

  @Column()
  opened_at: string;

  @Column()
  closed_at: string;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;

  @OneToOne((type) => User, (user) => user.shop, { eager: true })
  @JoinColumn({ name: 'owner_id' })
  user: User;

  @OneToMany((type) => Product, (product) => product.shop)
  products: Product[];
}
