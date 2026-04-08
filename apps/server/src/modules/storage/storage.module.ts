import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule implements OnModuleInit {
  constructor(private readonly storageService: StorageService) {}

  async onModuleInit() {
    await this.storageService.initialize();
  }
}