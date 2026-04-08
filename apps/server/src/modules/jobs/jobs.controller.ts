import { Controller, Get, Post, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get job statistics' })
  @ApiResponse({ status: 200, description: 'Job statistics' })
  async getStats() {
    return this.jobsService.getStats();
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry a failed job' })
  @ApiResponse({ status: 200, description: 'Job queued for retry' })
  async retry(@Param('id', ParseUUIDPipe) id: string) {
    await this.jobsService.retry(id);
    return { success: true };
  }

  @Post('clean')
  @ApiOperation({ summary: 'Clean completed jobs' })
  @ApiResponse({ status: 200, description: 'Completed jobs cleaned' })
  async clean() {
    await this.jobsService.cleanCompleted();
    return { success: true };
  }
}