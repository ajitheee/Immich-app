import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Asset } from './asset.entity';
import { Album } from './album.entity';
import { Person } from './person.entity';
import { Session } from './session.entity';
import { OAuthAccount } from './oauth-account.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255, nullable: true })
  passwordHash: string | null;

  @Column({ length: 255, nullable: true })
  name: string | null;

  @Column({ name: 'avatar_path', length: 500, nullable: true })
  avatarPath: string | null;

  @Column({ name: 'storage_quota', default: 10737418240 }) // 10GB
  storageQuota: number;

  @Column({ name: 'storage_used', default: 0 })
  storageUsed: number;

  @Column({ name: 'is_admin', default: false })
  isAdmin: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Asset, (asset) => asset.user)
  assets: Asset[];

  @OneToMany(() => Album, (album) => album.user)
  albums: Album[];

  @OneToMany(() => Person, (person) => person.user)
  people: Person[];

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => OAuthAccount, (oauthAccount) => oauthAccount.user)
  oauthAccounts: OAuthAccount[];
}