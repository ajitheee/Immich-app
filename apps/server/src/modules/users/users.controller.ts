import { Controller, Get, Patch, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto, UserResponseDto } from './dto/user.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile', type: UserResponseDto })
  async getCurrentUser(@Request() req: any): Promise<UserResponseDto> {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Updated user profile', type: UserResponseDto })
  async updateCurrentUser(
    @Request() req: any,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(req.user.id, dto);
    const { passwordHash, ...result } = user;
    return result;
  }

  @Get('me/storage')
  @ApiOperation({ summary: 'Get storage usage information' })
  @ApiResponse({ status: 200, description: 'Storage info' })
  async getStorageInfo(@Request() req: any) {
    return this.usersService.getStorageInfo(req.user.id);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 204, description: 'Account deleted' })
  async deleteAccount(@Request() req: any): Promise<void> {
    await this.usersService.delete(req.user.id);
  }
}