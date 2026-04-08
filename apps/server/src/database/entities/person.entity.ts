import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Face } from './face.entity';

@Entity('people')
@Index(['userId'])
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 255, nullable: true })
  name: string | null;

  @Column({ name: 'thumbnail_path', length: 500, nullable: true })
  thumbnailPath: string | null;

  @Column({ name: 'face_count', default: 0 })
  faceCount: number;

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.people, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Face, (face) => face.person)
  faces: Face[];
}