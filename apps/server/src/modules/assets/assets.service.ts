import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between, In } from 'typeorm';
import { Asset, AssetMetadata } from '../../database/entities';
import { CreateAssetDto, UpdateAssetDto, AssetQueryDto } from './dto/asset.dto';

export interface PaginatedAssets {
  items: Asset[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(AssetMetadata)
    private readonly metadataRepository: Repository<AssetMetadata>,
  ) {}

  async create(userId: string, dto: CreateAssetDto): Promise<Asset> {
    const asset = this.assetRepository.create({
      userId,
      fileName: dto.fileName,
      originalPath: dto.originalPath,
      fileSize: dto.fileSize,
      mimeType: dto.mimeType,
      type: dto.type,
      deviceId: dto.deviceId || null,
      capturedAt: dto.capturedAt || null,
    });

    return this.assetRepository.save(asset);
  }

  async findById(userId: string, id: string): Promise<Asset | null> {
    return this.assetRepository.findOne({
      where: { id, userId },
      relations: ['metadata'],
    });
  }

  async findMany(userId: string, query: AssetQueryDto): Promise<PaginatedAssets> {
    const { page = 1, pageSize = 50, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const where: FindManyOptions<Asset>['where'] = { userId };

    if (query.type) {
      where.type = query.type;
    }
    if (query.isFavorite !== undefined) {
      where.isFavorite = query.isFavorite;
    }
    if (query.isArchived !== undefined) {
      where.isArchived = query.isArchived;
    }
    if (query.isTrashed !== undefined) {
      where.isTrashed = query.isTrashed;
    } else {
      // By default, exclude trashed assets
      where.isTrashed = false;
    }

    const [items, total] = await this.assetRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['metadata'],
    });

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: total > page * pageSize,
    };
  }

  async update(userId: string, id: string, dto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.findById(userId, id);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    Object.assign(asset, dto);
    return this.assetRepository.save(asset);
  }

  async updateThumbnail(userId: string, id: string, thumbnailPath: string): Promise<void> {
    await this.assetRepository.update({ id, userId }, { thumbnailPath });
  }

  async softDelete(userId: string, ids: string[]): Promise<void> {
    await this.assetRepository.update(
      { id: In(ids), userId },
      { isTrashed: true },
    );
  }

  async restore(userId: string, ids: string[]): Promise<void> {
    await this.assetRepository.update(
      { id: In(ids), userId },
      { isTrashed: false },
    );
  }

  async hardDelete(userId: string, ids: string[]): Promise<void> {
    await this.assetRepository.delete({ id: In(ids), userId });
  }

  async toggleFavorite(userId: string, ids: string[], isFavorite: boolean): Promise<void> {
    await this.assetRepository.update(
      { id: In(ids), userId },
      { isFavorite },
    );
  }

  async toggleArchive(userId: string, ids: string[], isArchived: boolean): Promise<void> {
    await this.assetRepository.update(
      { id: In(ids), userId },
      { isArchived },
    );
  }

  async getStats(userId: string): Promise<{
    total: number;
    images: number;
    videos: number;
    archived: number;
    favorites: number;
    storageUsed: number;
  }> {
    const [total, images, videos, archived, favorites] = await Promise.all([
      this.assetRepository.count({ where: { userId, isTrashed: false } }),
      this.assetRepository.count({ where: { userId, type: 'IMAGE', isTrashed: false } }),
      this.assetRepository.count({ where: { userId, type: 'VIDEO', isTrashed: false } }),
      this.assetRepository.count({ where: { userId, isArchived: true, isTrashed: false } }),
      this.assetRepository.count({ where: { userId, isFavorite: true, isTrashed: false } }),
    ]);

    const { sum } = await this.assetRepository
      .createQueryBuilder('asset')
      .select('SUM(asset.fileSize)', 'sum')
      .where('asset.userId = :userId AND asset.isTrashed = false', { userId })
      .getRawOne();

    return {
      total,
      images,
      videos,
      archived,
      favorites,
      storageUsed: parseInt(sum) || 0,
    };
  }

  // Metadata methods
  async createMetadata(
    assetId: string,
    metadata: Partial<AssetMetadata>,
  ): Promise<AssetMetadata> {
    const meta = this.metadataRepository.create({
      ...metadata,
      assetId,
    });
    return this.metadataRepository.save(meta);
  }

  async updateMetadata(
    assetId: string,
    metadata: Partial<AssetMetadata>,
  ): Promise<void> {
    await this.metadataRepository.update({ assetId }, metadata);
  }
}