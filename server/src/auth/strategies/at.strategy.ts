import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { IRequestWithCookies } from '~/auth/types/auth.types';
import { JwtPayload } from '~/jwt-token/types/jwt-token.types';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const atSecret = config.get<string>('AT_SECRET');
    if (!atSecret) {
      throw new Error('AT_SECRET is not defined');
    }

    super({
      jwtFromRequest: AtStrategy.extractJwtFromCookies,
      secretOrKey: atSecret,
      passReqToCallback: true,
    });
  }

  private static extractJwtFromCookies(
    this: void,
    req: IRequestWithCookies,
  ): string | null {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
      throw new ForbiddenException('Access token not found in cookies');
    }

    return accessToken;
  }

  validate(req: IRequestWithCookies, payload: JwtPayload) {
    const accessToken = req.cookies.accessToken;

    return {
      sub: payload.sub,
      email: payload.email,
      accessToken,
    };
  }
}
