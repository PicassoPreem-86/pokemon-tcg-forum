/**
 * Thread Actions Tests
 *
 * These tests verify thread functionality including:
 * - Thread creation with validation and sanitization
 * - Thread updates with permission checks
 * - Thread deletion with proper authorization
 * - Like/unlike functionality
 * - Mention processing and notifications
 * - Rate limiting enforcement
 *
 * Run with: npm test threads.test.ts
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  createThread,
  updateThread,
  deleteThread,
  incrementViewCount,
  toggleThreadLike,
} from '../actions/threads';

// Mock Next.js functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock sanitization
jest.mock('../sanitize', () => ({
  sanitizeHtml: jest.fn((html: string) => html),
  createSafeExcerpt: jest.fn((html: string, length: number) => html.substring(0, length)),
}));

// Mock mentions
jest.mock('../mentions', () => ({
  extractAndValidateMentions: jest.fn(() => Promise.resolve([])),
}));

// Mock notifications
jest.mock('../actions/notifications', () => ({
  createNotification: jest.fn(() => Promise.resolve()),
}));

// Mock rate limiting
jest.mock('../rate-limit', () => ({
  checkRateLimit: jest.fn(() => Promise.resolve({ allowed: true, remaining: 4 })),
  formatRetryTime: jest.fn((seconds: number) => Promise.resolve(`${seconds} seconds`)),
}));

// Create mock Supabase client
const createMockSupabaseClient = () => {
  return {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
  };
};

// Mock Supabase server
jest.mock('../supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Thread Actions', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabaseClient();

    const { createClient } = require('../supabase/server');
    createClient.mockResolvedValue(mockSupabase);

    // Default: user is authenticated
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Reset rate limit mock to default (allowed)
    const { checkRateLimit, formatRetryTime } = require('../rate-limit');
    checkRateLimit.mockResolvedValue({ allowed: true, remaining: 4 });
    formatRetryTime.mockResolvedValue('1 minute');

    // Reset mentions mock to default (no mentions)
    const { extractAndValidateMentions } = require('../mentions');
    extractAndValidateMentions.mockResolvedValue([]);
  });

  describe('createThread', () => {
    const validThreadData = {
      title: 'Test Thread Title',
      content: 'This is a test thread content with enough characters.',
      categoryId: 'cat-123',
      tags: ['pokemon', 'tcg'],
    };

    it('should successfully create a thread', async () => {
      const mockThread = {
        id: 'thread-123',
        slug: 'test-thread-title-abc123',
        title: validThreadData.title,
        content: validThreadData.content,
        category_id: validThreadData.categoryId,
        author_id: mockUser.id,
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockThread,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'thread_tags') {
          return {
            insert: jest.fn(() => Promise.resolve({ error: null })),
          };
        }
        return {};
      });

      const result = await createThread(validThreadData);

      expect(result.success).toBe(true);
      expect(result.threadSlug).toBe(mockThread.slug);
      expect(mockSupabase.from).toHaveBeenCalledWith('threads');
    });

    it('should reject thread creation when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await createThread(validThreadData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You must be logged in to create a thread');
    });

    it('should enforce rate limiting', async () => {
      const { checkRateLimit, formatRetryTime } = require('../rate-limit');
      checkRateLimit.mockResolvedValue({ allowed: false, retryAfter: 60 });
      formatRetryTime.mockResolvedValue('1 minute');

      const result = await createThread(validThreadData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('creating threads too fast');
      expect(result.error).toContain('1 minute');
    });

    it('should reject thread with title less than 10 characters', async () => {
      const result = await createThread({
        ...validThreadData,
        title: 'Short',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Title must be at least 10 characters');
    });

    it('should reject thread with content less than 20 characters', async () => {
      const result = await createThread({
        ...validThreadData,
        content: 'Too short',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Content must be at least 20 characters');
    });

    it('should reject thread without category', async () => {
      const result = await createThread({
        ...validThreadData,
        categoryId: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Category is required');
    });

    it('should sanitize HTML content', async () => {
      const { sanitizeHtml } = require('../sanitize');

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { id: 't1', slug: 'test' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return { insert: jest.fn(() => Promise.resolve({ error: null })) };
      });

      await createThread({
        ...validThreadData,
        content: '<script>alert("xss")</script>Safe content here',
      });

      expect(sanitizeHtml).toHaveBeenCalled();
    });

    it('should insert tags when provided', async () => {
      const insertMock = jest.fn(() => Promise.resolve({ error: null }));

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { id: 't1', slug: 'test' },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'thread_tags') {
          return { insert: insertMock };
        }
        return {};
      });

      await createThread(validThreadData);

      expect(insertMock).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ tag: 'pokemon' }),
          expect.objectContaining({ tag: 'tcg' }),
        ])
      );
    });

    it('should process mentions and create notifications', async () => {
      const { extractAndValidateMentions } = require('../mentions');
      const { createNotification } = require('../actions/notifications');

      const mentionedUser = { id: 'user-456', username: 'mentioneduser' };
      extractAndValidateMentions.mockResolvedValue([mentionedUser]);

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 't1',
                    slug: 'test',
                    title: 'Test Thread',
                  },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { username: 'testuser' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return { insert: jest.fn(() => Promise.resolve({ error: null })) };
      });

      await createThread(validThreadData);

      expect(extractAndValidateMentions).toHaveBeenCalled();
      expect(createNotification).toHaveBeenCalledWith(
        mentionedUser.id,
        mockUser.id,
        'mention',
        expect.stringContaining('mentioned you'),
        expect.stringContaining('/thread/test')
      );
    });

    it('should not notify when user mentions themselves', async () => {
      const { extractAndValidateMentions } = require('../mentions');
      const { createNotification } = require('../actions/notifications');

      // User mentions themselves
      extractAndValidateMentions.mockResolvedValue([{ id: mockUser.id, username: 'testuser' }]);

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { id: 't1', slug: 'test', title: 'Test' },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { username: 'testuser' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return { insert: jest.fn(() => Promise.resolve({ error: null })) };
      });

      await createThread(validThreadData);

      expect(createNotification).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' },
            })),
          })),
        })),
      });

      const result = await createThread(validThreadData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create thread');
    });
  });

  describe('updateThread', () => {
    const validUpdateData = {
      threadId: 'thread-123',
      title: 'Updated Thread Title',
      content: 'Updated content with enough characters for validation.',
    };

    it('should successfully update thread as owner', async () => {
      const mockThread = {
        author_id: mockUser.id,
        slug: 'test-thread',
        category_id: 'cat-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockThread,
                  error: null,
                })),
              })),
            })),
            update: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'member' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const result = await updateThread(validUpdateData);

      expect(result.success).toBe(true);
      expect(result.threadSlug).toBe(mockThread.slug);
    });

    it('should allow moderators to update any thread', async () => {
      const mockThread = {
        author_id: 'different-user',
        slug: 'test-thread',
        category_id: 'cat-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockThread,
                  error: null,
                })),
              })),
            })),
            update: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'moderator' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const result = await updateThread(validUpdateData);

      expect(result.success).toBe(true);
    });

    it('should reject update when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await updateThread(validUpdateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You must be logged in to edit a thread');
    });

    it('should reject update when thread not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: null,
            })),
          })),
        })),
      });

      const result = await updateThread(validUpdateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Thread not found');
    });

    it('should reject update when user is not owner or moderator', async () => {
      const mockThread = {
        author_id: 'different-user',
        slug: 'test-thread',
        category_id: 'cat-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockThread,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'member' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const result = await updateThread(validUpdateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You do not have permission to edit this thread');
    });

    it('should validate title length', async () => {
      // Set up mocks - code fetches thread before validating
      const mockThread = {
        author_id: mockUser.id,
        slug: 'test-thread',
        category_id: 'cat-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockThread,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'member' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const result = await updateThread({
        ...validUpdateData,
        title: 'Short',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Title must be at least 10 characters');
    });

    it('should validate content length', async () => {
      // Set up mocks - code fetches thread before validating
      const mockThread = {
        author_id: mockUser.id,
        slug: 'test-thread',
        category_id: 'cat-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockThread,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'member' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const result = await updateThread({
        ...validUpdateData,
        content: 'Too short',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Content must be at least 20 characters');
    });
  });

  describe('deleteThread', () => {
    it('should successfully delete thread as owner', async () => {
      const mockThread = {
        author_id: mockUser.id,
        category_id: 'cat-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockThread,
                  error: null,
                })),
              })),
            })),
            delete: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'member' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const result = await deleteThread('thread-123');

      expect(result.success).toBe(true);
    });

    it('should allow admin to delete any thread', async () => {
      const mockThread = {
        author_id: 'different-user',
        category_id: 'cat-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockThread,
                  error: null,
                })),
              })),
            })),
            delete: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'admin' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const result = await deleteThread('thread-123');

      expect(result.success).toBe(true);
    });

    it('should reject deletion when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await deleteThread('thread-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('You must be logged in to delete a thread');
    });

    it('should reject deletion when user lacks permission', async () => {
      const mockThread = {
        author_id: 'different-user',
        category_id: 'cat-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'threads') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockThread,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { role: 'member' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const result = await deleteThread('thread-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('You do not have permission to delete this thread');
    });
  });

  describe('incrementViewCount', () => {
    it('should call RPC function to increment view count', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      await incrementViewCount('thread-123');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_view_count', {
        p_thread_id: 'thread-123',
      });
    });
  });

  describe('toggleThreadLike', () => {
    it('should like a thread when not already liked', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'thread_likes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(function(this: { eq: (field: string, value: string) => Promise<{ data: null }> }) {
                return this.eq('user_id', mockUser.id);
              }).mockReturnThis(),
              single: jest.fn(() => Promise.resolve({ data: null })), // Not liked yet
            })),
            insert: jest.fn(() => Promise.resolve({ error: null })),
          };
        }
        if (table === 'threads') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'thread-123',
                    slug: 'test',
                    title: 'Test Thread',
                    author_id: 'other-user',
                  },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { username: 'testuser' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const result = await toggleThreadLike('thread-123');

      expect(result.liked).toBe(true);
    });

    it('should unlike a thread when already liked', async () => {
      const existingLike = { id: 'like-123' };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'thread_likes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(function(this: { eq: (field: string, value: string) => Promise<{ data: typeof existingLike }> }) {
                return this.eq('user_id', mockUser.id);
              }).mockReturnThis(),
              single: jest.fn(() => Promise.resolve({ data: existingLike })),
            })),
            delete: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          };
        }
        return {};
      });

      const result = await toggleThreadLike('thread-123');

      expect(result.liked).toBe(false);
    });

    it('should create notification when liking someone elses thread', async () => {
      const { createNotification } = require('../actions/notifications');

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'thread_likes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(function(this: { eq: (field: string, value: string) => Promise<{ data: null }> }) {
                return this.eq('user_id', mockUser.id);
              }).mockReturnThis(),
              single: jest.fn(() => Promise.resolve({ data: null })),
            })),
            insert: jest.fn(() => Promise.resolve({ error: null })),
          };
        }
        if (table === 'threads') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'thread-123',
                    slug: 'test',
                    title: 'Test Thread',
                    author_id: 'other-user',
                  },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { username: 'testuser' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      await toggleThreadLike('thread-123');

      expect(createNotification).toHaveBeenCalledWith(
        'other-user',
        mockUser.id,
        'like',
        expect.stringContaining('liked your thread'),
        expect.stringContaining('/thread/test')
      );
    });

    it('should not create notification when liking own thread', async () => {
      const { createNotification } = require('../actions/notifications');

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'thread_likes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(function(this: { eq: (field: string, value: string) => Promise<{ data: null }> }) {
                return this.eq('user_id', mockUser.id);
              }).mockReturnThis(),
              single: jest.fn(() => Promise.resolve({ data: null })),
            })),
            insert: jest.fn(() => Promise.resolve({ error: null })),
          };
        }
        if (table === 'threads') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'thread-123',
                    slug: 'test',
                    title: 'Test Thread',
                    author_id: mockUser.id, // Same as liker
                  },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      await toggleThreadLike('thread-123');

      expect(createNotification).not.toHaveBeenCalled();
    });

    it('should return false when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await toggleThreadLike('thread-123');

      expect(result.liked).toBe(false);
    });
  });
});
