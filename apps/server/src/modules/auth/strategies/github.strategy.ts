import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface GitHubProfile {
  id: number;
  login: string;
  email: string | null;
  name: string | null;
  avatar_url: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

@Injectable()
export class GitHubOAuthStrategy {
  private readonly clientId = process.env.GITHUB_CLIENT_ID;
  private readonly clientSecret = process.env.GITHUB_CLIENT_SECRET;
  private readonly redirectUri = process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth/oauth/github/callback';

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId || '',
      redirect_uri: this.redirectUri,
      scope: 'user:email',
      response_type: 'code',
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async validate(code: string): Promise<{ providerUserId: string; email: string; name?: string }> {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.redirectUri,
    }, {
      headers: { Accept: 'application/json' },
    });

    const { access_token } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile: GitHubProfile = profileResponse.data;

    // Get primary email if not public
    let email = profile.email;
    if (!email) {
      const emailsResponse = await axios.get<GitHubEmail[]>('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const primaryEmail = emailsResponse.data.find(e => e.primary);
      email = primaryEmail?.email || '';
    }

    return {
      providerUserId: String(profile.id),
      email,
      name: profile.name || profile.login,
    };
  }
}