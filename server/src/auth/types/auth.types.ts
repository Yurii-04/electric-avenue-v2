import { Request } from 'express';

export interface IRequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
    accessToken?: string;
  } & Record<string, string | undefined>;
}

export interface GoogleProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

export interface GoogleAuthRequest extends Request {
  user: GoogleProfile;
}
