import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';
import { AlbumsModule } from './modules/albums/albums.module';
import { StorageModule } from './modules/storage/storage.module';
import { UploadModule } from './modules/upload/upload.module';
import { MetadataModule } from './modules/metadata/metadata.module';
import { SearchModule } from './modules/search/search.module';
import { PeopleModule } from './modules/people/people.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { join } from 'path';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'immich_clone',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),

    // Serve static files (uploaded photos/videos)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'data', 'storage'),
      serveRoot: '/storage',
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    AssetsModule,
    AlbumsModule,
    StorageModule,
    UploadModule,
    MetadataModule,
    SearchModule,
    PeopleModule,
    JobsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}