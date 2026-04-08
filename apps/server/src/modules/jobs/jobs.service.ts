import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../../database/entities';

export interface JobData {
  assetId: string;
  [key: string]: unknown;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async create(name: string, data: JobData): Promise<Job> {
    const job = this.jobRepository.create({
      name,
      data,
      status: 'pending',
    });
    return this.jobRepository.save(job);
  }

  async findPending(limit = 10): Promise<Job[]> {
    return this.jobRepository.find({
      where: { status: 'pending' },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async start(jobId: string): Promise<void> {
    await this.jobRepository.update(jobId, {
      status: 'running',
      startedAt: new Date(),
    });
  }

  async complete(jobId: string): Promise<void> {
    await this.jobRepository.update(jobId, {
      status: 'completed',
      completedAt: new Date(),
    });
  }

  async fail(jobId: string, error: string): Promise<void> {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) return;

    await this.jobRepository.update(jobId, {
      status: 'failed',
      error,
      attempts: job.attempts + 1,
    });
  }

  async retry(jobId: string): Promise<void> {
    await this.jobRepository.update(jobId, {
      status: 'pending',
      error: null,
    });
  }

  async getStats(): Promise<{
    pending: number;
    running: number;
    completed: number;
    failed: number;
  }> {
    const [pending, running, completed, failed] = await Promise.all([
      this.jobRepository.count({ where: { status: 'pending' } }),
      this.jobRepository.count({ where: { status: 'running' } }),
      this.jobRepository.count({ where: { status: 'completed' } }),
      this.jobRepository.count({ where: { status: 'failed' } }),
    ]);

    return { pending, running, completed, failed };
  }

  async cleanCompleted(olderThanDays = 7): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    await this.jobRepository.delete({
      status: 'completed',
      completedAt: cutoff,
    } as any);
  }
}