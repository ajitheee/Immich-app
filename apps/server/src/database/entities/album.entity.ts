import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Asset } from './asset.entity';

@Entity('albums')
@Index(['userId'])
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'cover_asset_id', nullable: true })
  coverAssetId: string | null;

  @Column({ name: 'is_shared', default: false })
  isShared: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.albums, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Asset, { nullable: true })
  @JoinColumn({ name: 'cover_asset_id' })
  coverAsset: Asset | null;

  @ManyToMany(() => Asset, (asset) => asset.albums)
  @JoinTable({
    name: 'album_assets',
    joinColumn: { name: 'album_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'asset_id', referencedColumnName: 'id' },
  })
  assets: Asset[];
}