import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('variants')
@Index(['productId', 'combinationKey'], { unique: true })
export class Variant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  color!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  size!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  material!: string | null;

  @Column({ type: 'varchar', length: 255 })
  combinationKey!: string;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  priceOverride!: number | null;

  @Column({ type: 'varchar', nullable: true })
  productId!: string;

  @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @CreateDateColumn()
  createdAt!: Date;
}
