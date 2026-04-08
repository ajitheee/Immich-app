import { Controller, Post, Body, UseGuards, Get, Request, Redirect, Param, Query, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { GoogleOAuthStrategy } from './strategies/google.strategy';
import { GitHubOAuthStrategy } from './strategies/github.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleStrategy: GoogleOAuthStrategy,
    private readonly gitHubStrategy: GitHubOAuthStrategy,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto, @Request() req: any) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 204, description: 'Logged out' })
  async logout(@Request() req: any, @Body() dto?: RefreshTokenDto) {
    await this.authService.logout(req.user.id, dto?.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req: any) {
    return req.user;
  }

  // OAuth routes
  @Get('oauth/google')
  @Redirect()
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  googleAuth() {
    const authUrl = this.googleStrategy.getAuthUrl();
    return { url: authUrl, statusCode: 302 };
  }

  @Get('oauth/google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    const user = await this.googleStrategy.validate(code);
    const result = await this.authService.validateOAuthUser(
      'google',
      user.providerUserId,
      user.email,
      user.name,
    );
    const tokens = await this.authService.generateTokens(result);

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
    res.redirect(redirectUrl);
  }

  @Get('oauth/github')
  @Redirect()
  @ApiOperation({ summary: 'Initiate GitHub OAuth flow' })
  githubAuth() {
    const authUrl = this.gitHubStrategy.getAuthUrl();
    return { url: authUrl, statusCode: 302 };
  }

  @Get('oauth/github/callback')
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubCallback(@Query('code') code: string, @Res() res: Response) {
    const user = await this.gitHubStrategy.validate(code);
    const result = await this.authService.validateOAuthUser(
      'github',
      user.providerUserId,
      user.email,
      user.name,
    );
    const tokens = await this.authService.generateTokens(result);

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
    res.redirect(redirectUrl);
  }
}