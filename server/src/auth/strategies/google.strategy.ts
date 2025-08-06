import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, VerifyCallback, Strategy } from 'passport-google-oauth20';
import { GoogleProfile } from '~/auth/types/auth.types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = configService.get<string>(
      'GOOGLE_OAUTH_CLIENT_SECRET',
    );
    const callbackURL = configService.get<string>('GOOGLE_OAUTH_CALLBACK_URL');
    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth credentials are not defined');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;

    const user: GoogleProfile = {
      id,
      email: emails?.[0]?.value || '',
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos?.[0]?.value,
    };

    done(null, user);
  }
}
