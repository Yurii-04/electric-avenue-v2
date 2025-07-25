export const constants = {
  REFRESH_TOKEN_NAME: 'refreshToken',
  ACCESS_TOKEN_NAME: 'accessToken',
  EXPIRE_DAY_REFRESH_TOKEN: 15,
  EXPIRE_MINUTES_ACCESS_TOKEN: 15,
  verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
} as const;
