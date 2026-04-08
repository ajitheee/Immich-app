import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadController } from './upload.controller';
import { StorageModule } from '../storage/storage.module';
import { AssetsModule } from '../assets/assets.module';
import { UsersModule } from '../users/users.module';
import { MetadataModule } from '../metadata/metadata.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
        files: 50,
      },
    }),
    StorageModule,
    AssetsModule,
    UsersModule,
    MetadataModule,
    JobsModule,
  ],
  controllers: [UploadController],
})
export class UploadModule {}