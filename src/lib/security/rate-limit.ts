import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limit result type
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Check if Upstash Redis is configured
const isRedisConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Redis client if configured
const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory fallback for development
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

// Create rate limiters with different configurations
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '60 s'),
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : null;

export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null;

export const aiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '60 s'),
      analytics: true,
      prefix: 'ratelimit:ai',
    })
  : null;

export const exportRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, '3600 s'), // 1 per hour
      analytics: true,
      prefix: 'ratelimit:export',
    })
  : null;

// Rate limiter types
export type RateLimiterType = 'api' | 'auth' | 'ai' | 'export';

// Get rate limiter by type
function getRateLimiter(type: RateLimiterType): Ratelimit | null {
  switch (type) {
    case 'api':
      return apiRateLimiter;
    case 'auth':
      return authRateLimiter;
    case 'ai':
      return aiRateLimiter;
    case 'export':
      return exportRateLimiter;
    default:
      return apiRateLimiter;
  }
}

// Get limits for in-memory fallback
function getLimits(type: RateLimiterType): { limit: number; windowMs: number } {
  switch (type) {
    case 'api':
      return { limit: 100, windowMs: 60000 };
    case 'auth':
      return { limit: 5, windowMs: 60000 };
    case 'ai':
      return { limit: 20, windowMs: 60000 };
    case 'export':
      return { limit: 1, windowMs: 3600000 };
    default:
      return { limit: 100, windowMs: 60000 };
  }
}

// In-memory rate limiting fallback
function checkInMemoryRateLimit(
  identifier: string,
  type: RateLimiterType
): RateLimitResult {
  const key = `${type}:${identifier}`;
  const now = Date.now();
  const { limit, windowMs } = getLimits(type);
  
  const entry = inMemoryStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new window
    inMemoryStore.set(key, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Math.floor((now + windowMs) / 1000),
    };
  }
  
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.floor(entry.resetTime / 1000),
    };
  }
  
  entry.count++;
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: Math.floor(entry.resetTime / 1000),
  };
}

// Clean up old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of inMemoryStore.entries()) {
      if (now > value.resetTime) {
        inMemoryStore.delete(key);
      }
    }
  }, 300000);
}

/**
 * Check rate limit for a given identifier
 * Uses Upstash Redis if configured, falls back to in-memory Map
 */
export async function checkRateLimit(
  identifier: string,
  limiterType: RateLimiterType = 'api'
): Promise<RateLimitResult> {
  // If Redis is not configured, use in-memory fallback
  if (!isRedisConfigured) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Rate Limit] Upstash Redis not configured. Using in-memory fallback.'
      );
    }
    return checkInMemoryRateLimit(identifier, limiterType);
  }

  const limiter = getRateLimiter(limiterType);
  
  if (!limiter) {
    // Fallback if limiter not created
    return {
      success: true,
      limit: 100,
      remaining: 100,
      reset: Math.floor(Date.now() / 1000) + 60,
    };
  }

  try {
    const result = await limiter.limit(identifier);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('[Rate Limit] Error checking rate limit:', error);
    // On error, allow the request but log
    return {
      success: true,
      limit: 100,
      remaining: 100,
      reset: Math.floor(Date.now() / 1000) + 60,
    };
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}
