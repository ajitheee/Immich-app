import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

// Simple EXIF parser for common metadata
interface ExifData {
  Make?: string;
  Model?: string;
  LensModel?: string;
  DateTime?: string;
  ExposureTime?: string;
  FNumber?: number;
  ISO?: number;
  FocalLength?: number;
  GPSLatitude?: number;
  GPSLongitude?: number;
  ImageWidth?: number;
  ImageHeight?: number;
}

@Injectable()
export class MetadataService {
  async extractImageMetadata(filePath: string): Promise<ExifData> {
    try {
      const buffer = await fs.readFile(filePath);

      // Check for JPEG
      if (buffer[0] === 0xff && buffer[1] === 0xd8) {
        return this.parseJpegExif(buffer);
      }

      // Check for PNG
      if (buffer[0] === 0x89 && buffer.toString('ascii', 1, 4) === 'PNG') {
        return this.parsePngMetadata(buffer);
      }

      // Check for HEIC/HEIF
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.heic' || ext === '.heif') {
        return this.parseHeicMetadata(filePath);
      }

      return {};
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return {};
    }
  }

  async extractVideoMetadata(filePath: string): Promise<ExifData> {
    try {
      // Use ffprobe if available, otherwise return empty
      const { exec } = require('child_process');
      const util = require('util');
      const execPromise = util.promisify(exec);

      try {
        const { stdout } = await execPromise(
          `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`,
        );
        const data = JSON.parse(stdout);

        const videoStream = data.streams?.find((s: any) => s.codec_type === 'video');
        const audioStream = data.streams?.find((s: any) => s.codec_type === 'audio');

        const creationTime = data.format?.tags?.creation_time;

        return {
          ImageWidth: videoStream?.width,
          ImageHeight: videoStream?.height,
          Make: data.format?.tags?.['com.apple.quicktime.make'],
          Model: data.format?.tags?.['com.apple.quicktime.model'],
          DateTime: creationTime,
          ISO: audioStream?.bits_per_raw_sample,
        };
      } catch {
        // ffprobe not available
        return {};
      }
    } catch (error) {
      return {};
    }
  }

  async getDimensions(filePath: string): Promise<{ width: number; height: number } | null> {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'].includes(ext);
      const isVideo = ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);

      if (isImage) {
        const metadata = await this.extractImageMetadata(filePath);
        if (metadata.ImageWidth && metadata.ImageHeight) {
          return { width: metadata.ImageWidth, height: metadata.ImageHeight };
        }
      } else if (isVideo) {
        const metadata = await this.extractVideoMetadata(filePath);
        if (metadata.ImageWidth && metadata.ImageHeight) {
          return { width: metadata.ImageWidth, height: metadata.ImageHeight };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private parseJpegExif(buffer: Buffer): ExifData {
    const result: ExifData = {};
    let offset = 2; // Skip JPEG marker

    // Find EXIF header
    while (offset < buffer.length - 4) {
      if (buffer[offset] === 0x45 && buffer[offset + 1] === 0x78 &&
          buffer[offset + 2] === 0x69 && buffer[offset + 3] === 0x66) {
        // Found "Exif" marker
        offset += 6;
        break;
      }
      offset++;
    }

    if (offset >= buffer.length - 2) {
      return result;
    }

    // This is a simplified parser - in production, use a proper EXIF library
    // For now, return basic data that would come from exif parser
    try {
      // Try to use exif library if available
      const exif = require('exif');
      // Would parse actual EXIF data here
      return result;
    } catch {
      return result;
    }
  }

  private parsePngMetadata(buffer: Buffer): ExifData {
    // PNG has XMP or tEXt chunks for metadata
    // Simplified - return empty for now
    return {};
  }

  private parseHeicMetadata(filePath: string): ExifData {
    // HEIC requires special parsing
    // Simplified - return empty for now
    return {};
  }
}