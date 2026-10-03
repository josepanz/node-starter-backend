/** Limiters nombrados globales. `client` es aparte: lo gobierna `ApiClientThrottlerGuard`. */
export const GLOBAL_LIMITERS = ['default', 'auth', 'upload', 'search'] as const;
export type GlobalLimiter = (typeof GLOBAL_LIMITERS)[number];

export const CLIENT_LIMITER = 'client';
export const RATE_LIMIT_PROFILE_KEY = 'rateLimitProfile';
