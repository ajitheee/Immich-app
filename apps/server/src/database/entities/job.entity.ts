import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'jsonb' })
  data: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: ['pending', 'running', 'completed', 'failed'] as const,
    default: 'pending',
  })
  status: JobStatus;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;
}