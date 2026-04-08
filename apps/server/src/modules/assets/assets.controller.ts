import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, AssetQueryDto, BulkDeleteDto, BulkArchiveDto, BulkFavoriteDto } from './dto/asset.dto';

@ApiTags('assets')
@Controller('assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all assets for current user' })
  @ApiResponse({ status: 200, description: 'List of assets' })
  async getAll(@Request() req: any, @Query() query: AssetQueryDto) {
    return this.assetsService.findMany(req.user.id, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get asset statistics' })
  @ApiResponse({ status: 200, description: 'Asset statistics' })
  async getStats(@Request() req: any) {
    return this.assetsService.getStats(req.user.id);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get favorite assets' })
  @ApiResponse({ status: 200, description: 'List of favorite assets' })
  async getFavorites(@Request() req: any, @Query() query: AssetQueryDto) {
    return this.assetsService.findMany(req.user.id, { ...query, isFavorite: true });
  }

  @Get('archived')
  @ApiOperation({ summary: 'Get archived assets' })
  @ApiResponse({ status: 200, description: 'List of archived assets' })
  async getArchived(@Request() req: any, @Query() query: AssetQueryDto) {
    return this.assetsService.findMany(req.user.id, { ...query, isArchived: true });
  }

  @Get('trash')
  @ApiOperation({ summary: 'Get trashed assets' })
  @ApiResponse({ status: 200, description: 'List of trashed assets' })
  async getTrash(@Request() req: any, @Query() query: AssetQueryDto) {
    return this.assetsService.findMany(req.user.id, { ...query, isTrashed: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiResponse({ status: 200, description: 'Asset details' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async getById(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const asset = await this.assetsService.findById(req.user.id, id);
    if (!asset) {
      throw new Error('Asset not found');
    }
    return asset;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({ status: 201, description: 'Asset created' })
  async create(@Request() req: any, @Body() dto: CreateAssetDto) {
    return this.assetsService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update asset' })
  @ApiResponse({ status: 200, description: 'Asset updated' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetsService.update(req.user.id, id, dto);
  }

  @Post('bulk/favorite')
  @ApiOperation({ summary: 'Bulk favorite/unfavorite assets' })
  @ApiResponse({ status: 200, description: 'Assets updated' })
  async bulkFavorite(@Request() req: any, @Body() dto: BulkFavoriteDto) {
    await this.assetsService.toggleFavorite(req.user.id, dto.assetIds, dto.isFavorite);
    return { success: true };
  }

  @Post('bulk/archive')
  @ApiOperation({ summary: 'Bulk archive/unarchive assets' })
  @ApiResponse({ status: 200, description: 'Assets updated' })
  async bulkArchive(@Request() req: any, @Body() dto: BulkArchiveDto) {
    await this.assetsService.toggleArchive(req.user.id, dto.assetIds, dto.isArchived);
    return { success: true };
  }

  @Post('bulk/trash')
  @ApiOperation({ summary: 'Bulk move to trash' })
  @ApiResponse({ status: 200, description: 'Assets moved to trash' })
  async bulkTrash(@Request() req: any, @Body() dto: BulkDeleteDto) {
    await this.assetsService.softDelete(req.user.id, dto.assetIds);
    return { success: true };
  }

  @Post('bulk/restore')
  @ApiOperation({ summary: 'Bulk restore from trash' })
  @ApiResponse({ status: 200, description: 'Assets restored' })
  async bulkRestore(@Request() req: any, @Body() dto: BulkDeleteDto) {
    await this.assetsService.restore(req.user.id, dto.assetIds);
    return { success: true };
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk permanently delete assets' })
  @ApiResponse({ status: 200, description: 'Assets deleted' })
  async bulkDelete(@Request() req: any, @Body() dto: BulkDeleteDto) {
    await this.assetsService.hardDelete(req.user.id, dto.assetIds);
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete asset' })
  @ApiResponse({ status: 200, description: 'Asset deleted' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.assetsService.hardDelete(req.user.id, [id]);
    return { success: true };
  }
}