/**
 * Reply Actions Tests
 *
 * These tests verify reply functionality including:
 * - Reply creation with validation and sanitization
 * - Reply updates with permission checks
 * - Reply deletion with proper authorization
 * - Like/unlike functionality
 * - Mention processing and notifications
 * - Rate limiting enforcement
 *
 * Run with: npm test replies.test.ts
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  createReply,
  updateReply,
  deleteReply,
  toggleReplyLike,
} from '../actions/replies';

// Mock Next.js functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock sanitization
jest.mock('../sanitize', () => ({
  sanitizeHtml: jest.fn((html: string) => html),
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
  };
};

// Mock Supabase server
jest.mock('../supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Reply Actions', () => {
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

  describe('createReply', () => {
    const validReplyData = {
      threadId: 'thread-123',
      content: 'This is a test reply with enough content.',
      parentReplyId: null,
    };

    it('should successfully create a reply', async () => {
      const mockThread = {
        id: 'thread-123',
        slug: 'test-thread',
        is_locked: false,
      };

      const mockReply = {
        id: 'reply-123',
        thread_id: 'thread-123',
        author_id: mockUser.id,
        content: validReplyData.content,
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
        if (table === 'replies') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockReply,
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

      const result = await createReply(validReplyData);

      expect(result.success).toBe(true);
      expect(result.replyId).toBe('reply-123');
    });

    it('should reject reply creation when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await createReply(validReplyData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You must be logged in to reply');
    });

    it('should enforce rate limiting', async () => {
      const { checkRateLimit, formatRetryTime } = require('../rate-limit');
      checkRateLimit.mockResolvedValue({ allowed: false, retryAfter: 60 });
      formatRetryTime.mockResolvedValue('1 minute');

      const result = await createReply(validReplyData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('posting too fast');
      expect(result.error).toContain('1 minute');
    });

    it('should reject reply without thread ID', async () => {
      const result = await createReply({
        ...validReplyData,
        threadId: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Thread ID is required');
    });

    it('should reject reply with content less than 5 characters', async () => {
      const result = await createReply({
        ...validReplyData,
        content: 'Hi',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Reply must be at least 5 characters');
    });

    it('should reject reply to non-existent thread', async () => {
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

      const result = await createReply(validReplyData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Thread not found');
    });

    it('should reject reply to locked thread', async () => {
      const mockThread = {
        id: 'thread-123',
        slug: 'test-thread',
        is_locked: true,
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockThread,
              error: null,
            })),
          })),
        })),
      });

      const result = await createReply(validReplyData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('This thread is locked');
    });

    it('should sanitize HTML content', async () => {
      const { sanitizeHtml } = require('../sanitize');

      const mockThread = {
        id: 'thread-123',
        slug: 'test-thread',
        is_locked: false,
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
        if (table === 'replies') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { id: 'reply-123' },
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

      await createReply({
        ...validReplyData,
        content: '<script>alert("xss")</script>Safe content here',
      });

      expect(sanitizeHtml).toHaveBeenCalled();
    });

    it('should process mentions and create notifications', async () => {
      const { extractAndValidateMentions } = require('../mentions');
      const { createNotification } = require('../actions/notifications');

      const mentionedUser = { id: 'user-456', username: 'mentioneduser' };
      extractAndValidateMentions.mockResolvedValue([mentionedUser]);

      const mockThread = {
        id: 'thread-123',
        slug: 'test-thread',
        title: 'Test Thread',
        is_locked: false,
        author_id: 'author-789',
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
        if (table === 'replies') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { id: 'reply-123' },
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

      await createReply({
        ...validReplyData,
        content: 'Hey @mentioneduser check this out!',
      });

      expect(extractAndValidateMentions).toHaveBeenCalled();
      expect(createNotification).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const mockThread = {
        id: 'thread-123',
        slug: 'test-thread',
        is_locked: false,
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
        if (table === 'replies') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: null,
                  error: { message: 'Database error' },
                })),
              })),
            })),
          };
        }
        return {};
      });

      const result = await createReply(validReplyData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create reply');
    });
  });

  describe('updateReply', () => {
    const validUpdateData = {
      replyId: 'reply-123',
      content: 'This is updated reply content with enough chars.',
    };

    it('should successfully update reply as owner', async () => {
      const mockReply = {
        author_id: mockUser.id,
        thread_id: 'thread-123',
      };

      const mockThread = {
        slug: 'test-thread',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'replies') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockReply,
                  error: null,
                })),
              })),
            })),
            update: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          };
        }
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
        return {};
      });

      const result = await updateReply(validUpdateData);

      expect(result.success).toBe(true);
      expect(result.replyId).toBe('reply-123');
    });

    it('should allow moderators to update any reply', async () => {
      const mockReply = {
        author_id: 'different-user',
        thread_id: 'thread-123',
      };

      const mockThread = {
        slug: 'test-thread',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'replies') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockReply,
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
        return {};
      });

      const result = await updateReply(validUpdateData);

      expect(result.success).toBe(true);
    });

    it('should reject update when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await updateReply(validUpdateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You must be logged in to edit a reply');
    });

    it('should reject update when reply not found', async () => {
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

      const result = await updateReply(validUpdateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Reply not found');
    });

    it('should reject update when user is not owner or moderator', async () => {
      const mockReply = {
        author_id: 'different-user',
        thread_id: 'thread-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'replies') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockReply,
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

      const result = await updateReply(validUpdateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You do not have permission to edit this reply');
    });

    it('should validate content length', async () => {
      const mockReply = {
        author_id: mockUser.id,
        thread_id: 'thread-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'replies') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockReply,
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const result = await updateReply({
        ...validUpdateData,
        content: 'Hi',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Reply must be at least 5 characters');
    });

    it('should reject update without reply ID', async () => {
      const result = await updateReply({
        ...validUpdateData,
        replyId: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Reply ID is required');
    });
  });

  describe('deleteReply', () => {
    it('should successfully delete reply as owner', async () => {
      const mockReply = {
        author_id: mockUser.id,
        thread_id: 'thread-123',
      };

      const mockThread = {
        slug: 'test-thread',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'replies') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockReply,
                  error: null,
                })),
              })),
            })),
            delete: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          };
        }
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
        return {};
      });

      const result = await deleteReply('reply-123');

      expect(result.success).toBe(true);
    });

    it('should allow admin to delete any reply', async () => {
      const mockReply = {
        author_id: 'different-user',
        thread_id: 'thread-123',
      };

      const mockThread = {
        slug: 'test-thread',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'replies') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockReply,
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
        return {};
      });

      const result = await deleteReply('reply-123');

      expect(result.success).toBe(true);
    });

    it('should reject deletion when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await deleteReply('reply-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('You must be logged in to delete a reply');
    });

    it('should reject deletion when reply not found', async () => {
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

      const result = await deleteReply('reply-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Reply not found');
    });

    it('should reject deletion when user lacks permission', async () => {
      const mockReply = {
        author_id: 'different-user',
        thread_id: 'thread-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'replies') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockReply,
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

      const result = await deleteReply('reply-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('You do not have permission to delete this reply');
    });

    it('should handle database errors gracefully', async () => {
      const mockReply = {
        author_id: mockUser.id,
        thread_id: 'thread-123',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'replies') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockReply,
                  error: null,
                })),
              })),
            })),
            delete: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: { message: 'Database error' } })),
            })),
          };
        }
        return {};
      });

      const result = await deleteReply('reply-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete reply');
    });
  });

  describe('toggleReplyLike', () => {
    it('should like a reply when not already liked', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'reply_likes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: null, // Not liked
                    error: null,
                  })),
                })),
              })),
            })),
            insert: jest.fn(() => Promise.resolve({ error: null })),
          };
        }
        if (table === 'replies') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { like_count: 5 },
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

      const result = await toggleReplyLike('reply-123');

      expect(result.liked).toBe(true);
      expect(result.likeCount).toBe(5);
    });

    it('should unlike a reply when already liked', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'reply_likes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'like-123' }, // Already liked
                    error: null,
                  })),
                })),
              })),
            })),
            delete: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          };
        }
        if (table === 'replies') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { like_count: 4 },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const result = await toggleReplyLike('reply-123');

      expect(result.liked).toBe(false);
      expect(result.likeCount).toBe(4);
    });

    it('should create notification when liking someone elses reply', async () => {
      const { createNotification } = require('../actions/notifications');

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'reply_likes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: null,
                    error: null,
                  })),
                })),
              })),
            })),
            insert: jest.fn(() => Promise.resolve({ error: null })),
          };
        }
        if (table === 'replies') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'reply-123',
                    author_id: 'different-user',
                    thread_id: 'thread-123',
                    like_count: 5,
                    threads: { slug: 'test-thread', title: 'Test Thread' },
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

      await toggleReplyLike('reply-123');

      expect(createNotification).toHaveBeenCalledWith(
        'different-user',
        mockUser.id,
        'like',
        expect.stringContaining('liked your reply'),
        expect.stringContaining('/thread/')
      );
    });

    it('should not create notification when liking own reply', async () => {
      const { createNotification } = require('../actions/notifications');

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'reply_likes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: null,
                    error: null,
                  })),
                })),
              })),
            })),
            insert: jest.fn(() => Promise.resolve({ error: null })),
          };
        }
        if (table === 'replies') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'reply-123',
                    author_id: mockUser.id, // Own reply
                    thread_id: 'thread-123',
                    like_count: 5,
                    threads: { slug: 'test-thread', title: 'Test Thread' },
                  },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      await toggleReplyLike('reply-123');

      // Notification should NOT be created for own reply
      expect(createNotification).not.toHaveBeenCalled();
    });

    it('should return false when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await toggleReplyLike('reply-123');

      expect(result.liked).toBe(false);
      expect(result.likeCount).toBe(0);
    });
  });
});
