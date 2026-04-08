import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Album, Asset } from '../../database/entities';
import { CreateAlbumDto, UpdateAlbumDto, AlbumQueryDto, AddAssetsDto, RemoveAssetsDto } from './dto/album.dto';

export interface PaginatedAlbums {
  items: Album[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async create(userId: string, dto: CreateAlbumDto): Promise<Album> {
    const album = this.albumRepository.create({
      userId,
      name: dto.name,
      description: dto.description || null,
    });

    const savedAlbum = await this.albumRepository.save(album);

    // Add assets if provided
    if (dto.assetIds && dto.assetIds.length > 0) {
      await this.addAssets(userId, savedAlbum.id, { assetIds: dto.assetIds });
    }

    return savedAlbum;
  }

  async findMany(userId: string, query: AlbumQueryDto): Promise<PaginatedAlbums> {
    const { page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const where: any = { userId };

    if (query.isShared !== undefined) {
      where.isShared = query.isShared;
    }

    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }

    const [items, total] = await this.albumRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['coverAsset'],
    });

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: total > page * pageSize,
    };
  }

  async findById(userId: string, id: string): Promise<Album | null> {
    return this.albumRepository.findOne({
      where: { id, userId },
      relations: ['coverAsset', 'assets', 'assets.metadata'],
    });
  }

  async update(userId: string, id: string, dto: UpdateAlbumDto): Promise<Album> {
    const album = await this.findById(userId, id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    Object.assign(album, dto);
    return this.albumRepository.save(album);
  }

  async delete(userId: string, id: string): Promise<void> {
    const album = await this.findById(userId, id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    await this.albumRepository.remove(album);
  }

  async addAssets(userId: string, albumId: string, dto: AddAssetsDto): Promise<Album> {
    const album = await this.findById(userId, albumId);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    const assets = await this.assetRepository.find({
      where: { id: In(dto.assetIds), userId },
    });

    if (assets.length !== dto.assetIds.length) {
      throw new NotFoundException('Some assets not found');
    }

    album.assets = [...(album.assets || []), ...assets];
    return this.albumRepository.save(album);
  }

  async removeAssets(userId: string, albumId: string, dto: RemoveAssetsDto): Promise<Album> {
    const album = await this.findById(userId, albumId);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    const removeSet = new Set(dto.assetIds);
    album.assets = (album.assets || []).filter((asset) => !removeSet.has(asset.id));

    return this.albumRepository.save(album);
  }

  async getAssets(userId: string, albumId: string, page = 1, pageSize = 50) {
    const album = await this.albumRepository.findOne({
      where: { id: albumId, userId },
      relations: ['assets', 'assets.metadata'],
    });

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    const assets = album.assets || [];
    const total = assets.length;
    const start = (page - 1) * pageSize;
    const items = assets.slice(start, start + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: start + pageSize < total,
    };
  }

  async setCover(userId: string, albumId: string, assetId: string): Promise<Album> {
    const album = await this.findById(userId, albumId);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    // Verify asset exists in album
    const assetExists = (album.assets || []).some((a) => a.id === assetId);
    if (!assetExists) {
      throw new NotFoundException('Asset not found in album');
    }

    album.coverAssetId = assetId;
    return this.albumRepository.save(album);
  }

  async getStats(userId: string): Promise<{ total: number; shared: number }> {
    const [total, shared] = await Promise.all([
      this.albumRepository.count({ where: { userId } }),
      this.albumRepository.count({ where: { userId, isShared: true } }),
    ]);

    return { total, shared };
  }
}