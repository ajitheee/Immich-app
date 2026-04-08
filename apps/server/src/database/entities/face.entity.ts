import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Asset } from './asset.entity';
import { Person } from './person.entity';

@Entity('faces')
@Index(['assetId'])
@Index(['personId'])
export class Face {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_id' })
  assetId: string;

  @Column({ name: 'person_id', nullable: true })
  personId: string | null;

  @Column({ type: 'vector', size: 512, nullable: true })
  embedding: number[] | null;

  @Column({ name: 'bounding_box', type: 'jsonb' })
  boundingBox: { x: number; y: number; width: number; height: number };

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  confidence: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Asset, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @ManyToOne(() => Person, (person) => person.faces, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'person_id' })
  person: Person | null;
}