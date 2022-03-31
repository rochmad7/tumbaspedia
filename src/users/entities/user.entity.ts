import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { Exclude } from 'class-transformer';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  address: string;

  @Column()
  phone_number: string;

  @Column()
  profile_picture: string;

  @Column({ default: false })
  is_verified: boolean;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  @DeleteDateColumn({ select: false })
  deleted_at: Date;

  @ManyToOne((type) => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role' })
  role: Role;

  @OneToOne((type) => Shop, (shop) => shop.user)
  shop: Shop;

  @OneToMany((type) => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}
