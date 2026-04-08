import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleOAuthStrategy } from './strategies/google.strategy';
import { GitHubOAuthStrategy } from './strategies/github.strategy';
import { User } from '../../database/entities';
import { Session } from '../../database/entities/session.entity';
import { OAuthAccount } from '../../database/entities/oauth-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, OAuthAccount]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleOAuthStrategy, GitHubOAuthStrategy],
  exports: [AuthService],
})
export class AuthModule {}