import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  ManyToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { AssetMetadata } from './asset-metadata.entity';
import { Album } from './album.entity';

export type AssetType = 'IMAGE' | 'VIDEO';

@Entity('assets')
@Index(['userId', 'createdAt'])
@Index(['userId', 'capturedAt'])
@Index(['userId', 'isArchived'])
@Index(['userId', 'isFavorite'])
@Index(['userId', 'isTrashed'])
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'device_id', length: 255, nullable: true })
  deviceId: string | null;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'original_path', length: 500 })
  originalPath: string;

  @Column({ name: 'thumbnail_path', length: 500, nullable: true })
  thumbnailPath: string | null;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: ['IMAGE', 'VIDEO'] as const,
  })
  type: AssetType;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @Column({ name: 'is_favorite', default: false })
  isFavorite: boolean;

  @Column({ name: 'is_trashed', default: false })
  isTrashed: boolean;

  @Column({ name: 'captured_at', type: 'timestamp', nullable: true })
  capturedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.assets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => AssetMetadata, (metadata) => metadata.asset, { cascade: true })
  metadata: AssetMetadata;

  @ManyToMany(() => Album, (album) => album.assets)
  albums: Album[];
}