import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Session } from '../../database/entities/session.entity';
import { OAuthAccount } from '../../database/entities/oauth-account.entity';

export interface AuthResult {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(OAuthAccount)
    private readonly oauthAccountRepository: Repository<OAuthAccount>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name || null,
      storageQuota: 10737418240, // 10GB default
    });

    await this.userRepository.save(user);

    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async validateOAuthUser(
    provider: string,
    providerUserId: string,
    email: string,
    name?: string,
  ): Promise<User> {
    // Check if OAuth account exists
    let oauthAccount = await this.oauthAccountRepository.findOne({
      where: { provider, providerUserId },
      relations: ['user'],
    });

    if (oauthAccount) {
      return oauthAccount.user;
    }

    // Check if user exists with this email
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        email,
        name: name || null,
        passwordHash: null, // OAuth users don't need password
        storageQuota: 10737418240,
      });
      await this.userRepository.save(user);
    }

    // Create OAuth account
    oauthAccount = this.oauthAccountRepository.create({
      userId: user.id,
      provider,
      providerUserId,
    });
    await this.oauthAccountRepository.save(oauthAccount);

    return user;
  }

  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const session = await this.sessionRepository.findOne({
        where: { tokenHash: this.hashToken(refreshToken) },
        relations: ['user'],
      });

      if (!session || session.userId !== payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (new Date() > session.expiresAt) {
        await this.sessionRepository.remove(session);
        throw new UnauthorizedException('Refresh token expired');
      }

      await this.sessionRepository.remove(session);
      return this.generateTokens(session.user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.sessionRepository.delete({ tokenHash: this.hashToken(refreshToken) });
    } else {
      // Logout from all sessions
      await this.sessionRepository.delete({ userId });
    }
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  private async generateTokens(user: User): Promise<AuthResult> {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      },
    );

    // Save session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = this.sessionRepository.create({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt,
    });
    await this.sessionRepository.save(session);

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  private hashToken(token: string): string {
    // Simple hash for storage
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}