import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateAlbumDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assetIds?: string[];
}

export class UpdateAlbumDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverAssetId?: string;

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}

export class AlbumQueryDto {
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
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isShared?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'updatedAt' | 'name' = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class AddAssetsDto {
  @IsArray()
  @IsString({ each: true })
  assetIds: string[];
}

export class RemoveAssetsDto {
  @IsArray()
  @IsString({ each: true })
  assetIds: string[];
}