import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { IRequestWithCookies } from '~/auth/types/auth.types';
import { JwtPayload } from '~/jwt-token/types/jwt-token.types';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    const rtSecret = config.get<string>('RT_SECRET');
    if (!rtSecret) {
      throw new Error('RT_SECRET is not defined');
    }

    super({
      jwtFromRequest: RtStrategy.extractJwtFromCookies,
      secretOrKey: rtSecret,
      passReqToCallback: true,
    });
  }

  private static extractJwtFromCookies(
    this: void,
    req: IRequestWithCookies,
  ): string | null {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token not found in cookies');
    }

    return refreshToken;
  }

  validate(req: IRequestWithCookies, payload: JwtPayload) {
    const refreshToken = req.cookies.refreshToken;

    return {
      sub: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
