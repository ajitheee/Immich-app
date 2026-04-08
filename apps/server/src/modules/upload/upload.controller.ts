import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from '../storage/storage.service';
import { AssetsService } from '../assets/assets.service';
import { UsersService } from '../users/users.service';
import { MetadataService } from '../metadata/metadata.service';
import { JobsService } from '../jobs/jobs.service';
import { AssetType } from '../../database/entities';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(
    private readonly storageService: StorageService,
    private readonly assetsService: AssetsService,
    private readonly usersService: UsersService,
    private readonly metadataService: MetadataService,
    private readonly jobsService: JobsService,
  ) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadSingle(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    if (!isImage && !isVideo) {
      throw new BadRequestException('Only image and video files are allowed');
    }

    // Check storage quota
    const storageInfo = await this.usersService.getStorageInfo(req.user.id);
    if (storageInfo.available < file.size) {
      throw new BadRequestException('Storage quota exceeded');
    }

    // Store file
    const stored = await this.storageService.storeFile(req.user.id, file);

    // Determine asset type
    const type: AssetType = isImage ? 'IMAGE' : 'VIDEO';

    // Create asset record
    const asset = await this.assetsService.create(req.user.id, {
      fileName: file.originalname,
      originalPath: stored.filePath,
      fileSize: stored.fileSize,
      mimeType: stored.mimeType,
      type,
    });

    // Update storage used
    await this.usersService.updateStorageUsed(req.user.id, file.size);

    // Queue metadata extraction job
    await this.jobsService.create('metadata-extraction', {
      assetId: asset.id,
      filePath: stored.filePath,
    });

    // Queue thumbnail generation job
    await this.jobsService.create('thumbnail-generation', {
      assetId: asset.id,
      filePath: stored.filePath,
      type,
    });

    return {
      id: asset.id,
      fileName: asset.fileName,
      fileSize: asset.fileSize,
      mimeType: asset.mimeType,
      type: asset.type,
      createdAt: asset.createdAt,
    };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 50))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  async uploadMultiple(
    @Request() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Calculate total size
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    // Check storage quota
    const storageInfo = await this.usersService.getStorageInfo(req.user.id);
    if (storageInfo.available < totalSize) {
      throw new BadRequestException('Storage quota exceeded');
    }

    const results = [];

    for (const file of files) {
      // Validate file type
      const isImage = file.mimetype.startsWith('image/');
      const isVideo = file.mimetype.startsWith('video/');
      if (!isImage && !isVideo) {
        results.push({
          fileName: file.originalname,
          error: 'Invalid file type',
        });
        continue;
      }

      try {
        // Store file
        const stored = await this.storageService.storeFile(req.user.id, file);

        // Determine asset type
        const type: AssetType = isImage ? 'IMAGE' : 'VIDEO';

        // Create asset record
        const asset = await this.assetsService.create(req.user.id, {
          fileName: file.originalname,
          originalPath: stored.filePath,
          fileSize: stored.fileSize,
          mimeType: stored.mimeType,
          type,
        });

        // Queue jobs
        await this.jobsService.create('metadata-extraction', {
          assetId: asset.id,
          filePath: stored.filePath,
        });

        await this.jobsService.create('thumbnail-generation', {
          assetId: asset.id,
          filePath: stored.filePath,
          type,
        });

        results.push({
          id: asset.id,
          fileName: asset.fileName,
          fileSize: asset.fileSize,
          mimeType: asset.mimeType,
          type: asset.type,
          createdAt: asset.createdAt,
        });
      } catch (error) {
        results.push({
          fileName: file.originalname,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }

    // Update storage used
    await this.usersService.updateStorageUsed(req.user.id, totalSize);

    return {
      total: files.length,
      successful: results.filter((r) => !r.error).length,
      failed: results.filter((r) => r.error).length,
      results,
    };
  }
}