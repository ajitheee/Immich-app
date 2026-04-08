import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  avatarPath?: string;
}

export class UpdatePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  newPassword: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  name: string | null;
  avatarPath: string | null;
  storageQuota: number;
  storageUsed: number;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}