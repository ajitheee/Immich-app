import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface StoredFile {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

@Injectable()
export class StorageService {
  private readonly basePath: string;
  private readonly uploadDir: string;
  private readonly thumbnailDir: string;
  private readonly encodedDir: string;

  constructor(private readonly configService: ConfigService) {
    this.basePath = this.configService.get('STORAGE_PATH', './data/storage');
    this.uploadDir = this.configService.get('UPLOAD_DIR', 'uploads');
    this.thumbnailDir = this.configService.get('THUMBNAIL_DIR', 'thumbnails');
    this.encodedDir = this.configService.get('ENCODED_DIR', 'encoded');
  }

  async initialize(): Promise<void> {
    // Create directories if they don't exist
    await fs.mkdir(path.join(this.basePath, this.uploadDir), { recursive: true });
    await fs.mkdir(path.join(this.basePath, this.thumbnailDir), { recursive: true });
    await fs.mkdir(path.join(this.basePath, this.encodedDir), { recursive: true });
  }

  async storeFile(
    userId: string,
    file: Express.Multer.File,
    subDir?: string,
  ): Promise<StoredFile> {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Generate unique filename
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `${uuidv4()}${ext}`;

    // Create user directory
    const userDir = path.join(
      this.basePath,
      this.uploadDir,
      subDir || '',
      userId.slice(0, 2), // First 2 chars of UUID for better distribution
      userId,
    );
    await fs.mkdir(userDir, { recursive: true });

    // Write file
    const filePath = path.join(userDir, fileName);
    await fs.writeFile(filePath, file.buffer);

    return {
      id: uuidv4(),
      originalName: file.originalname,
      fileName,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  async storeBuffer(
    userId: string,
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    subDir?: string,
  ): Promise<StoredFile> {
    const ext = path.extname(originalName).toLowerCase() || this.getExtensionFromMime(mimeType);
    const fileName = `${uuidv4()}${ext}`;

    const userDir = path.join(
      this.basePath,
      this.uploadDir,
      subDir || '',
      userId.slice(0, 2),
      userId,
    );
    await fs.mkdir(userDir, { recursive: true });

    const filePath = path.join(userDir, fileName);
    await fs.writeFile(filePath, buffer);

    return {
      id: uuidv4(),
      originalName,
      fileName,
      filePath,
      fileSize: buffer.length,
      mimeType,
    };
  }

  async storeThumbnail(
    userId: string,
    buffer: Buffer,
    assetId: string,
    size: 'small' | 'medium' | 'large' = 'medium',
  ): Promise<string> {
    const fileName = `${assetId}_${size}.webp`;
    const userDir = path.join(
      this.basePath,
      this.thumbnailDir,
      userId.slice(0, 2),
      userId,
    );
    await fs.mkdir(userDir, { recursive: true });

    const filePath = path.join(userDir, fileName);
    await fs.writeFile(filePath, buffer);

    return filePath;
  }

  async getFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
    } catch {
      throw new BadRequestException('File not found');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch {
      // File might not exist, ignore
    }
  }

  async getFileStream(filePath: string): Promise<NodeJS.ReadableStream> {
    const { createReadStream } = require('fs');
    try {
      return createReadStream(filePath);
    } catch {
      throw new BadRequestException('File not found');
    }
  }

  async getStats(filePath: string): Promise<{ size: number; created: Date; modified: Date }> {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  }

  private getExtensionFromMime(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/heic': '.heic',
      'image/heif': '.heif',
      'video/mp4': '.mp4',
      'video/quicktime': '.mov',
      'video/x-msvideo': '.avi',
      'video/x-matroska': '.mkv',
      'video/webm': '.webm',
    };
    return mimeToExt[mimeType] || '.bin';
  }

  getRelativePath(absolutePath: string): string {
    return absolutePath.replace(this.basePath, '').replace(/^\/+/, '');
  }
}