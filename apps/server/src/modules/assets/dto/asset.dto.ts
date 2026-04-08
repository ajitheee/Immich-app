import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AssetType } from '../../../database/entities';

export class CreateAssetDto {
  @IsString()
  fileName: string;

  @IsString()
  originalPath: string;

  @IsInt()
  fileSize: number;

  @IsString()
  mimeType: string;

  @IsEnum(['IMAGE', 'VIDEO'])
  type: AssetType;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  capturedAt?: Date;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}

export class AssetQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number = 50;

  @IsOptional()
  @IsEnum(['IMAGE', 'VIDEO'])
  type?: AssetType;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isFavorite?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isArchived?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isTrashed?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'capturedAt' | 'fileSize' = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class BulkDeleteDto {
  @IsString({ each: true })
  assetIds: string[];
}

export class BulkArchiveDto {
  @IsString({ each: true })
  assetIds: string[];

  @IsBoolean()
  isArchived: boolean;
}

export class BulkFavoriteDto {
  @IsString({ each: true })
  assetIds: string[];

  @IsBoolean()
  isFavorite: boolean;
}