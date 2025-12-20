/**
 * Rate Limiting Utility for Pokemon TCG Forum
 *
 * IMPORTANT: This implementation uses an in-memory store suitable for single-instance
 * serverless deployments. For multi-instance production deployments, replace the
 * in-memory store with Redis or a distributed cache solution.
 *
 * Redis implementation would look like:
 * - Store key: `rate_limit:${userId}:${action}`
 * - Value: count
 * - TTL: windowMs
 * - Use INCR and EXPIRE commands
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/supabase/database.types';
// Import types and config from separate file (Next.js 15/16 'use server' files can only export async functions)
import {
  type RateLimitConfig,
  type RateLimitResult,
  type RateLimitRecord,
  RATE_LIMIT_CONFIGS,
} from './rate-limit-types';

// Re-export types for consumers (this is allowed - re-exporting types)
export type { RateLimitConfig, RateLimitResult } from './rate-limit-types';

/**
 * In-memory store for rate limits
 * WARNING: This will reset when the serverless function cold starts.
 * For production with multiple instances, use Redis.
 */
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Clean up expired entries from the in-memory store
 * This prevents memory leaks in long-running processes
 */
function cleanupExpiredEntries(now: number): void {
  const entriesToDelete: string[] = [];

  rateLimitStore.forEach((record, key) => {
    // Get the action from the key (format: userId:action)
    const action = key.split(':')[1];
    const config = RATE_LIMIT_CONFIGS[action];

    if (config && now - record.windowStart >= config.windowMs) {
      entriesToDelete.push(key);
    }
  });

  entriesToDelete.forEach(key => rateLimitStore.delete(key));
}

/**
 * Get user's role from the database
 */
async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single() as { data: { role: UserRole } | null; error: Error | null };

    if (error || !data) {
      console.error('[Rate Limit] Failed to get user role:', error);
      return null;
    }

    return data.role;
  } catch (err) {
    console.error('[Rate Limit] Exception getting user role:', err);
    return null;
  }
}

/**
 * Check if user is exempt from rate limiting based on their role
 */
function isExemptRole(userRole: UserRole | null, config: RateLimitConfig): boolean {
  if (!userRole || !config.exemptRoles) {
    return false;
  }
  return config.exemptRoles.includes(userRole);
}

/**
 * Create a rate limiter for a specific action
 */
export async function createRateLimiter(config: RateLimitConfig) {
  return async (userId: string, action: string): Promise<RateLimitResult> => {
    // Get user role to check exemptions
    const userRole = await getUserRole(userId);

    // Check if user is exempt from rate limiting
    if (isExemptRole(userRole, config)) {
      return {
        allowed: true,
        remaining: config.maxRequests,
      };
    }

    const now = Date.now();
    const key = `${userId}:${action}`;

    // Cleanup old entries periodically (10% chance per request)
    if (Math.random() < 0.1) {
      cleanupExpiredEntries(now);
    }

    // Get or create rate limit record
    let record = rateLimitStore.get(key);

    // If no record exists or window has expired, create new window
    if (!record || now - record.windowStart >= config.windowMs) {
      record = {
        count: 0,
        windowStart: now,
      };
      rateLimitStore.set(key, record);
    }

    // Calculate reset time
    const resetAt = new Date(record.windowStart + config.windowMs);

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      const retryAfterMs = (record.windowStart + config.windowMs) - now;
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);

      return {
        allowed: false,
        retryAfter: retryAfterSec,
        remaining: 0,
        resetAt,
      };
    }

    // Increment count
    record.count++;
    rateLimitStore.set(key, record);

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - record.count),
      resetAt,
    };
  };
}

/**
 * Check rate limit for a user action
 *
 * @param userId - The user's ID
 * @param action - The action being rate limited (must match a key in RATE_LIMIT_CONFIGS)
 * @returns Rate limit result with allowed status and metadata
 */
export async function checkRateLimit(userId: string, action: string): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[action];

  if (!config) {
    console.error(`[Rate Limit] Unknown action: ${action}`);
    // If action is not configured, allow by default (fail open)
    return { allowed: true };
  }

  const rateLimiter = await createRateLimiter(config);
  return rateLimiter(userId, action);
}

/**
 * Format retry time for user-friendly error messages
 */
export async function formatRetryTime(seconds: number): Promise<string> {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}

/**
 * Get rate limit status without incrementing the counter
 * Useful for showing warnings before users hit the limit
 */
export async function getRateLimitStatus(userId: string, action: string): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[action];

  if (!config) {
    return { allowed: true };
  }

  // Check if user is exempt
  const userRole = await getUserRole(userId);
  if (isExemptRole(userRole, config)) {
    return {
      allowed: true,
      remaining: config.maxRequests,
    };
  }

  const now = Date.now();
  const key = `${userId}:${action}`;
  const record = rateLimitStore.get(key);

  if (!record || now - record.windowStart >= config.windowMs) {
    return {
      allowed: true,
      remaining: config.maxRequests,
    };
  }

  const resetAt = new Date(record.windowStart + config.windowMs);
  const remaining = Math.max(0, config.maxRequests - record.count);

  if (record.count >= config.maxRequests) {
    const retryAfterMs = (record.windowStart + config.windowMs) - now;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);

    return {
      allowed: false,
      retryAfter: retryAfterSec,
      remaining: 0,
      resetAt,
    };
  }

  return {
    allowed: true,
    remaining,
    resetAt,
  };
}

/**
 * Reset rate limit for a user (admin function)
 * Useful for manually clearing rate limits
 */
export async function resetRateLimit(userId: string, action: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    // Only admins can reset rate limits
    const userRole = await getUserRole(user.id);
    if (userRole !== 'admin') {
      console.warn(`[Rate Limit] Non-admin user ${user.id} attempted to reset rate limit`);
      return false;
    }

    const key = `${userId}:${action}`;
    rateLimitStore.delete(key);

    console.log(`[Rate Limit] Admin ${user.id} reset rate limit for user ${userId}, action ${action}`);
    return true;
  } catch (err) {
    console.error('[Rate Limit] Failed to reset rate limit:', err);
    return false;
  }
}
