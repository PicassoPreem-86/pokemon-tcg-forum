/**
 * Rate Limiting Tests
 *
 * These tests verify the rate limiting functionality works correctly.
 * Run with: npm test rate-limit.test.ts
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { checkRateLimit, formatRetryTime, __clearAllRateLimits } from '../rate-limit';
import { RATE_LIMIT_CONFIGS } from '../rate-limit-types';

// Mock Supabase client
jest.mock('../supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'test-admin-id' } },
        error: null,
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { role: 'member' },
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

describe('Rate Limiting', () => {
  const testUserId = 'test-user-123';

  beforeEach(async () => {
    // Clear rate limit store between tests
    await __clearAllRateLimits();
    jest.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within the limit', async () => {
      const result = await checkRateLimit(testUserId, 'thread_create');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeDefined();
      expect(result.remaining).toBeLessThanOrEqual(5);
    });

    it('should block requests exceeding the limit', async () => {
      const action = 'thread_create';
      const limit = RATE_LIMIT_CONFIGS[action].maxRequests;

      // Make requests up to the limit
      for (let i = 0; i < limit; i++) {
        const result = await checkRateLimit(testUserId, action);
        expect(result.allowed).toBe(true);
      }

      // Next request should be blocked
      const blockedResult = await checkRateLimit(testUserId, action);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.retryAfter).toBeGreaterThan(0);
    });

    it('should track different actions separately', async () => {
      // Thread creation
      const threadResult = await checkRateLimit(testUserId, 'thread_create');
      expect(threadResult.allowed).toBe(true);

      // Reply creation (different action)
      const replyResult = await checkRateLimit(testUserId, 'reply_create');
      expect(replyResult.allowed).toBe(true);
    });

    it('should handle unknown actions gracefully', async () => {
      const result = await checkRateLimit(testUserId, 'unknown_action');
      expect(result.allowed).toBe(true);
    });
  });

  describe('formatRetryTime', () => {
    it('should format seconds correctly', async () => {
      expect(await formatRetryTime(30)).toBe('30 seconds');
      expect(await formatRetryTime(1)).toBe('1 second');
    });

    it('should format minutes correctly', async () => {
      expect(await formatRetryTime(120)).toBe('2 minutes');
      expect(await formatRetryTime(60)).toBe('1 minute');
    });

    it('should format hours correctly', async () => {
      expect(await formatRetryTime(3600)).toBe('1 hour');
      expect(await formatRetryTime(7200)).toBe('2 hours');
    });
  });

  describe('Rate Limit Configurations', () => {
    it('should have valid configuration for thread creation', () => {
      const config = RATE_LIMIT_CONFIGS.thread_create;

      expect(config).toBeDefined();
      expect(config.maxRequests).toBe(5);
      expect(config.windowMs).toBe(3600000); // 1 hour
      expect(config.exemptRoles).toContain('moderator');
      expect(config.exemptRoles).toContain('admin');
    });

    it('should have valid configuration for reply creation', () => {
      const config = RATE_LIMIT_CONFIGS.reply_create;

      expect(config).toBeDefined();
      expect(config.maxRequests).toBe(20);
      expect(config.windowMs).toBe(3600000);
    });

    it('should have valid configuration for like actions', () => {
      const config = RATE_LIMIT_CONFIGS.like_action;

      expect(config).toBeDefined();
      expect(config.maxRequests).toBe(100);
      expect(config.windowMs).toBe(3600000);
      expect(config.exemptRoles).toBeUndefined(); // No exemptions for likes
    });

    it('should have valid configuration for profile updates', () => {
      const config = RATE_LIMIT_CONFIGS.profile_update;

      expect(config).toBeDefined();
      expect(config.maxRequests).toBe(10);
      expect(config.windowMs).toBe(3600000);
    });
  });
});
