import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class UpdatePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}