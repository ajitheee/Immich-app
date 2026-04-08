import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities';
import { UpdateUserDto, UpdatePasswordDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }
    if (dto.avatarPath !== undefined) {
      user.avatarPath = dto.avatarPath;
    }

    return this.userRepository.save(user);
  }

  async updatePassword(id: string, dto: UpdatePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('User registered with OAuth');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepository.save(user);
  }

  async updateStorageUsed(id: string, bytes: number): Promise<void> {
    await this.userRepository.increment({ id }, 'storageUsed', bytes);
  }

  async getStorageInfo(id: string): Promise<{ used: number; quota: number; available: number }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      used: user.storageUsed,
      quota: user.storageQuota,
      available: Math.max(0, user.storageQuota - user.storageUsed),
    };
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete({ id });
  }
}