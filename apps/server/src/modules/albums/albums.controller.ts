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
import { AlbumsService } from './albums.service';
import { CreateAlbumDto, UpdateAlbumDto, AlbumQueryDto, AddAssetsDto, RemoveAssetsDto } from './dto/album.dto';

@ApiTags('albums')
@Controller('albums')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all albums' })
  @ApiResponse({ status: 200, description: 'List of albums' })
  async getAll(@Request() req: any, @Query() query: AlbumQueryDto) {
    return this.albumsService.findMany(req.user.id, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get album statistics' })
  @ApiResponse({ status: 200, description: 'Album statistics' })
  async getStats(@Request() req: any) {
    return this.albumsService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get album by ID' })
  @ApiResponse({ status: 200, description: 'Album details' })
  @ApiResponse({ status: 404, description: 'Album not found' })
  async getById(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const album = await this.albumsService.findById(req.user.id, id);
    if (!album) {
      throw new Error('Album not found');
    }
    return album;
  }

  @Get(':id/assets')
  @ApiOperation({ summary: 'Get assets in album' })
  @ApiResponse({ status: 200, description: 'Assets in album' })
  async getAssets(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 50,
  ) {
    return this.albumsService.getAssets(req.user.id, id, page, pageSize);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new album' })
  @ApiResponse({ status: 201, description: 'Album created' })
  async create(@Request() req: any, @Body() dto: CreateAlbumDto) {
    return this.albumsService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update album' })
  @ApiResponse({ status: 200, description: 'Album updated' })
  @ApiResponse({ status: 404, description: 'Album not found' })
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAlbumDto,
  ) {
    return this.albumsService.update(req.user.id, id, dto);
  }

  @Post(':id/assets')
  @ApiOperation({ summary: 'Add assets to album' })
  @ApiResponse({ status: 200, description: 'Assets added' })
  async addAssets(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddAssetsDto,
  ) {
    return this.albumsService.addAssets(req.user.id, id, dto);
  }

  @Delete(':id/assets')
  @ApiOperation({ summary: 'Remove assets from album' })
  @ApiResponse({ status: 200, description: 'Assets removed' })
  async removeAssets(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RemoveAssetsDto,
  ) {
    return this.albumsService.removeAssets(req.user.id, id, dto);
  }

  @Patch(':id/cover')
  @ApiOperation({ summary: 'Set album cover' })
  @ApiResponse({ status: 200, description: 'Cover set' })
  async setCover(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('assetId') assetId: string,
  ) {
    return this.albumsService.setCover(req.user.id, id, assetId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete album' })
  @ApiResponse({ status: 200, description: 'Album deleted' })
  async delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.albumsService.delete(req.user.id, id);
    return { success: true };
  }
}