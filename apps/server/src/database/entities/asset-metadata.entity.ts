import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Asset } from './asset.entity';

@Entity('asset_metadata')
@Index(['assetId'], { unique: true })
export class AssetMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_id' })
  assetId: string;

  @Column({ name: 'exif_data', type: 'jsonb', nullable: true })
  exifData: Record<string, unknown> | null;

  @Column({ type: 'integer', nullable: true })
  width: number | null;

  @Column({ type: 'integer', nullable: true })
  height: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Column({ name: 'camera_make', length: 100, nullable: true })
  cameraMake: string | null;

  @Column({ name: 'camera_model', length: 100, nullable: true })
  cameraModel: string | null;

  @Column({ name: 'lens_model', length: 100, nullable: true })
  lensModel: string | null;

  @Column({ type: 'integer', nullable: true })
  iso: number | null;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  aperture: number | null;

  @Column({ name: 'shutter_speed', length: 50, nullable: true })
  shutterSpeed: string | null;

  @Column({ name: 'focal_length', type: 'decimal', precision: 5, scale: 2, nullable: true })
  focalLength: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @OneToOne(() => Asset, (asset) => asset.metadata, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;
}