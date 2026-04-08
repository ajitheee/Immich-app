import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Asset } from '../../database/entities';

export interface SearchParams {
  query?: string;
  userId: string;
  type?: 'IMAGE' | 'VIDEO';
  isFavorite?: boolean;
  isArchived?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  items: Asset[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async search(params: SearchParams): Promise<SearchResult> {
    const {
      query,
      userId,
      type,
      isFavorite,
      isArchived,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 50,
    } = params;

    let qb = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.metadata', 'metadata')
      .where('asset.userId = :userId', { userId })
      .andWhere('asset.isTrashed = false');

    // Text search
    if (query) {
      qb = qb.andWhere(
        '(asset.fileName ILIKE :query OR metadata.cameraMake ILIKE :query OR metadata.cameraModel ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    // Type filter
    if (type) {
      qb = qb.andWhere('asset.type = :type', { type });
    }

    // Favorite filter
    if (isFavorite !== undefined) {
      qb = qb.andWhere('asset.isFavorite = :isFavorite', { isFavorite });
    }

    // Archive filter
    if (isArchived !== undefined) {
      qb = qb.andWhere('asset.isArchived = :isArchived', { isArchived });
    }

    // Date range filter
    if (dateFrom) {
      qb = qb.andWhere('asset.capturedAt >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      qb = qb.andWhere('asset.capturedAt <= :dateTo', { dateTo });
    }

    // Location filter
    if (params.latitude && params.longitude && params.radius) {
      qb = qb.andWhere(
        `ST_DWithin(
          ST_MakePoint(metadata.longitude, metadata.latitude)::geography,
          ST_MakePoint(:longitude, :latitude)::geography,
          :radius
        )`,
        {
          latitude: params.latitude,
          longitude: params.longitude,
          radius: params.radius * 1000, // Convert km to meters
        },
      );
    }

    // Count and paginate
    const total = await qb.getCount();
    const items = await qb
      .orderBy('asset.capturedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('asset.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: total > page * pageSize,
    };
  }

  async getTimeline(
    userId: string,
    year?: number,
    month?: number,
    page = 1,
    pageSize = 100,
  ): Promise<{ date: string; count: number; assets: Asset[] }[]> {
    let qb = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.metadata', 'metadata')
      .where('asset.userId = :userId', { userId })
      .andWhere('asset.isTrashed = false')
      .andWhere('asset.isArchived = false');

    if (year) {
      qb = qb.andWhere('EXTRACT(YEAR FROM asset.capturedAt) = :year', { year });
    }
    if (month) {
      qb = qb.andWhere('EXTRACT(MONTH FROM asset.capturedAt) = :month', { month });
    }

    const assets = await qb
      .orderBy('asset.capturedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('asset.createdAt', 'DESC')
      .getMany();

    // Group by date
    const grouped = new Map<string, Asset[]>();
    for (const asset of assets) {
      const date = asset.capturedAt
        ? asset.capturedAt.toISOString().split('T')[0]
        : asset.createdAt.toISOString().split('T')[0];

      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(asset);
    }

    // Convert to array and paginate
    const entries = Array.from(grouped.entries()).map(([date, assets]) => ({
      date,
      count: assets.length,
      assets,
    }));

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return entries.slice(start, end);
  }

  async getYears(userId: string): Promise<{ year: number; count: number }[]> {
    const result = await this.assetRepository
      .createQueryBuilder('asset')
      .select('EXTRACT(YEAR FROM asset.capturedAt)', 'year')
      .addSelect('COUNT(*)', 'count')
      .where('asset.userId = :userId', { userId })
      .andWhere('asset.isTrashed = false')
      .andWhere('asset.capturedAt IS NOT NULL')
      .groupBy('EXTRACT(YEAR FROM asset.capturedAt)')
      .orderBy('year', 'DESC')
      .getRawMany();

    return result.map((r) => ({
      year: parseInt(r.year),
      count: parseInt(r.count),
    }));
  }

  async getLocations(userId: string): Promise<{ latitude: number; longitude: number; count: number }[]> {
    const result = await this.assetRepository
      .createQueryBuilder('asset')
      .leftJoin('asset.metadata', 'metadata')
      .select('metadata.latitude', 'latitude')
      .addSelect('metadata.longitude', 'longitude')
      .addSelect('COUNT(*)', 'count')
      .where('asset.userId = :userId', { userId })
      .andWhere('asset.isTrashed = false')
      .andWhere('metadata.latitude IS NOT NULL')
      .andWhere('metadata.longitude IS NOT NULL')
      .groupBy('metadata.latitude')
      .addGroupBy('metadata.longitude')
      .getRawMany();

    return result.map((r) => ({
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      count: parseInt(r.count),
    }));
  }
}