import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search assets' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(
    @Request() req: any,
    @Query('q') query?: string,
    @Query('type') type?: 'IMAGE' | 'VIDEO',
    @Query('isFavorite') isFavorite?: string,
    @Query('isArchived') isArchived?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius?: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 50,
  ) {
    return this.searchService.search({
      query,
      userId: req.user.id,
      type,
      isFavorite: isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined,
      isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      latitude: latitude ? parseFloat(latitude.toString()) : undefined,
      longitude: longitude ? parseFloat(longitude.toString()) : undefined,
      radius,
      page: parseInt(page.toString()),
      pageSize: parseInt(pageSize.toString()),
    });
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get timeline view' })
  @ApiResponse({ status: 200, description: 'Timeline data' })
  async getTimeline(
    @Request() req: any,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 100,
  ) {
    return this.searchService.getTimeline(
      req.user.id,
      year ? parseInt(year.toString()) : undefined,
      month ? parseInt(month.toString()) : undefined,
      parseInt(page.toString()),
      parseInt(pageSize.toString()),
    );
  }

  @Get('years')
  @ApiOperation({ summary: 'Get years with photos' })
  @ApiResponse({ status: 200, description: 'Years list' })
  async getYears(@Request() req: any) {
    return this.searchService.getYears(req.user.id);
  }

  @Get('locations')
  @ApiOperation({ summary: 'Get photo locations' })
  @ApiResponse({ status: 200, description: 'Locations list' })
  async getLocations(@Request() req: any) {
    return this.searchService.getLocations(req.user.id);
  }
}