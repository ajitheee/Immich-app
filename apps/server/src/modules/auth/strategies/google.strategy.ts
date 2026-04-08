import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface GoogleProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

@Injectable()
export class GoogleOAuthStrategy {
  private readonly clientId = process.env.GOOGLE_CLIENT_ID;
  private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  private readonly redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/oauth/google/callback';

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId || '',
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async validate(code: string): Promise<{ providerUserId: string; email: string; name?: string }> {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile: GoogleProfile = profileResponse.data;

    return {
      providerUserId: profile.id,
      email: profile.email,
      name: profile.name,
    };
  }
}