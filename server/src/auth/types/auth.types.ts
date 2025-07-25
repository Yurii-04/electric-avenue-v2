export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type AccessToken = Pick<Tokens, 'accessToken'>;

export type JwtPayload = {
  email: string;
  sub: string;
};

import { Request } from 'express';

export interface IRequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
    accessToken?: string;
  } & Record<string, string | undefined>;
}
