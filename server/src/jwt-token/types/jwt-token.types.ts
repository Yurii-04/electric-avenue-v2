export type JwtPayload = {
  email: string;
  sub: string;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};
