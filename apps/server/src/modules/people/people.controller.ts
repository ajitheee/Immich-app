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
import { PeopleService } from './people.service';

@ApiTags('people')
@Controller('people')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all people' })
  @ApiResponse({ status: 200, description: 'List of people' })
  async getAll(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 50,
  ) {
    return this.peopleService.findAll(req.user.id, parseInt(page.toString()), parseInt(pageSize.toString()));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get people statistics' })
  @ApiResponse({ status: 200, description: 'People statistics' })
  async getStats(@Request() req: any) {
    return this.peopleService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get person by ID' })
  @ApiResponse({ status: 200, description: 'Person details' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  async getById(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const person = await this.peopleService.findById(req.user.id, id);
    if (!person) {
      throw new Error('Person not found');
    }
    return person;
  }

  @Get(':id/assets')
  @ApiOperation({ summary: 'Get assets for a person' })
  @ApiResponse({ status: 200, description: 'Assets for person' })
  async getAssets(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 50,
  ) {
    return this.peopleService.getAssets(
      req.user.id,
      id,
      parseInt(page.toString()),
      parseInt(pageSize.toString()),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new person' })
  @ApiResponse({ status: 201, description: 'Person created' })
  async create(@Request() req: any, @Body('name') name?: string) {
    return this.peopleService.create(req.user.id, name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update person' })
  @ApiResponse({ status: 200, description: 'Person updated' })
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { name?: string; isHidden?: boolean },
  ) {
    return this.peopleService.update(req.user.id, id, data);
  }

  @Post(':id/merge')
  @ApiOperation({ summary: 'Merge people' })
  @ApiResponse({ status: 200, description: 'People merged' })
  async merge(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) targetId: string,
    @Body('sourceIds') sourceIds: string[],
  ) {
    return this.peopleService.merge(req.user.id, targetId, sourceIds);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete person' })
  @ApiResponse({ status: 200, description: 'Person deleted' })
  async delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.peopleService.delete(req.user.id, id);
    return { success: true };
  }

  @Post('faces/:faceId/assign')
  @ApiOperation({ summary: 'Assign face to person' })
  @ApiResponse({ status: 200, description: 'Face assigned' })
  async assignFace(
    @Request() req: any,
    @Param('faceId', ParseUUIDPipe) faceId: string,
    @Body('personId') personId: string | null,
  ) {
    await this.peopleService.assignFace(req.user.id, faceId, personId);
    return { success: true };
  }
}