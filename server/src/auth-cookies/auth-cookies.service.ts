import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { constants } from '~/jwt-token/consts';
import { Tokens } from '~/jwt-token/types/jwt-token.types';

@Injectable()
export class AuthCookiesService {
  private getCookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'strict' as const,
      secure: process.env.NODE_ENV === 'prod',
    };
  }

  addTokensToCookies(res: Response, tokens: Tokens): void {
    res.cookie(constants.ACCESS_TOKEN_NAME, tokens.accessToken, {
      ...this.getCookieOptions(),
      maxAge: constants.EXPIRE_MINUTES_ACCESS_TOKEN * 60 * 1000,
    });

    res.cookie(constants.REFRESH_TOKEN_NAME, tokens.refreshToken, {
      ...this.getCookieOptions(),
      maxAge: constants.EXPIRE_DAY_REFRESH_TOKEN * 24 * 60 * 60 * 1000,
    });
  }

  removeTokensFromResponse(res: Response) {
    res.clearCookie(constants.REFRESH_TOKEN_NAME, this.getCookieOptions());
    res.clearCookie(constants.ACCESS_TOKEN_NAME, this.getCookieOptions());
  }
}
