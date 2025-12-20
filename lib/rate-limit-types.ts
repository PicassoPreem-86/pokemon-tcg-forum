// Rate limit types - separate file because 'use server' files can only export async functions

import type { UserRole } from '@/lib/supabase/database.types';

/**
 * Configuration for rate limiting
 */
export interface RateLimitConfig {
  windowMs: number;        // Time window in milliseconds
  maxRequests: number;     // Maximum requests allowed in the window
  exemptRoles?: UserRole[]; // Roles exempt from rate limiting
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;        // Whether the request is allowed
  retryAfter?: number;     // Seconds until user can retry (if not allowed)
  remaining?: number;      // Remaining requests in current window
  resetAt?: Date;          // When the rate limit window resets
}

/**
 * In-memory rate limit record
 */
export interface RateLimitRecord {
  count: number;
  windowStart: number;
}

/**
 * Rate limit configurations for different actions
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Thread creation: 5 per hour (3600000 ms)
  thread_create: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    exemptRoles: ['moderator', 'admin'],
  },

  // Reply creation: 20 per hour
  reply_create: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    exemptRoles: ['moderator', 'admin'],
  },

  // Like actions: 100 per hour
  like_action: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 100,
    // No exemptions for likes - even moderators should be rate limited
  },

  // Profile updates: 10 per hour
  profile_update: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    exemptRoles: ['moderator', 'admin'],
  },
};
