import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset, AssetMetadata } from '../../database/entities';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, AssetMetadata])],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}