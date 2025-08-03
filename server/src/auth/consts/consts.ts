export const constants = {
  verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
} as const;
