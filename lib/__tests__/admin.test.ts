/**
 * Admin Actions Tests
 *
 * These tests verify admin functionality including:
 * - Dashboard statistics retrieval
 * - User management (role updates, deletions)
 * - Activity tracking
 * - Security checks and permissions
 * - Rate limiting on admin actions
 *
 * Run with: npm test admin.test.ts
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  getAdminStats,
  getAllUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getRecentActivity,
  getTopContributors,
  searchUsers,
  bulkUpdateUserRoles,
} from '../actions/admin';

// Mock Next.js functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock admin auth utilities
const mockAdminProfile = {
  id: 'admin-123',
  username: 'admin',
  role: 'admin' as const,
};

const mockModeratorProfile = {
  id: 'mod-123',
  username: 'moderator',
  role: 'moderator' as const,
};

jest.mock('../auth/admin-check', () => ({
  withAdminAuth: jest.fn((callback) => {
    // Default to admin profile, can be overridden in tests
    return callback(mockAdminProfile);
  }),
  logAdminAction: jest.fn(() => Promise.resolve()),
}));

jest.mock('../auth/utils', () => ({
  checkRateLimit: jest.fn(() => true),
}));

jest.mock('../actions/moderation-log', () => ({
  logModerationAction: jest.fn(() => Promise.resolve()),
}));

// Create mock Supabase client
const createMockSupabaseClient = () => {
  return {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  };
};

// Mock Supabase server
jest.mock('../supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Admin Actions', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabaseClient();

    const { createClient } = require('../supabase/server');
    createClient.mockResolvedValue(mockSupabase);

    // Reset admin auth mock to default
    const { withAdminAuth } = require('../auth/admin-check');
    withAdminAuth.mockImplementation((callback: (profile: typeof mockAdminProfile) => unknown) => {
      return callback(mockAdminProfile);
    });

    // Reset rate limiting to allow by default
    const { checkRateLimit } = require('../auth/utils');
    checkRateLimit.mockReturnValue(true);
  });

  describe('getAdminStats', () => {
    it('should return comprehensive dashboard statistics', async () => {
      // Mock all count queries
      mockSupabase.from.mockImplementation((table: string) => {
        const counts: Record<string, number> = {
          profiles: 150,
          threads: 500,
          replies: 2000,
        };

        return {
          select: jest.fn(() => ({
            gte: jest.fn(() => ({
              // For "today" queries, return smaller numbers
            })),
          })),
        };
      });

      // Setup specific mock responses
      let callCount = 0;
      mockSupabase.from.mockImplementation((table: string) => ({
        select: jest.fn(() => ({
          gte: jest.fn((field: string, value: string) => {
            // Return promises for count queries
            if (field === 'created_at') {
              callCount++;
              // Return different counts for different "today" queries
              const todayCounts = [10, 25, 100]; // users, threads, replies today
              return Promise.resolve({ count: todayCounts[callCount - 1] || 0 });
            }
            return Promise.resolve({ count: 0 });
          }),
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null })),
          })),
        })),
      }));

      // Base counts
      const selectMock = {
        gte: jest.fn(() => Promise.resolve({ count: 0 })),
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null })),
        })),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => selectMock),
      });

      // Override for total counts
      let fromCallCount = 0;
      mockSupabase.from.mockImplementation((table: string) => {
        fromCallCount++;
        const baseCounts: Record<string, number> = {
          profiles: 150,
          threads: 500,
          replies: 2000,
        };

        return {
          select: jest.fn((fields: string, options: { count?: string; head?: boolean }) => {
            if (options?.count === 'exact' && options?.head === true) {
              return {
                gte: jest.fn((field: string) => {
                  if (field === 'created_at') {
                    // Today counts
                    const todayMapping: Record<string, number> = {
                      profiles: 10,
                      threads: 25,
                      replies: 100,
                    };
                    return Promise.resolve({ count: todayMapping[table] || 0 });
                  }
                  return Promise.resolve({ count: 0 });
                }),
                eq: jest.fn(() => Promise.resolve({ count: 5 })), // banned users
              };
            }
            // For queries with actual data
            return {
              gte: jest.fn(() => Promise.resolve({ data: [] })),
            };
          }),
        };
      });

      // Mock total counts directly
      const mockCounts = new Map([
        [0, 150], // profiles
        [1, 500], // threads
        [2, 2000], // replies
        [3, 10], // new users today
        [4, 25], // new threads today
        [5, 100], // new replies today
      ]);

      let queryIndex = 0;
      mockSupabase.from.mockImplementation((table: string) => ({
        select: jest.fn(() => {
          const count = mockCounts.get(queryIndex++) || 0;
          return {
            gte: jest.fn(() => Promise.resolve({ count, data: [] })),
            eq: jest.fn(() => Promise.resolve({ count: 5 })), // banned users
          };
        }),
      }));

      const stats = await getAdminStats();

      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('totalPosts');
      expect(stats).toHaveProperty('totalThreads');
      expect(stats).toHaveProperty('activeToday');
      expect(stats).toHaveProperty('newUsersToday');
      expect(stats).toHaveProperty('newPostsToday');
      expect(stats).toHaveProperty('bannedUsers');
    });

    it('should handle missing is_banned column gracefully', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.reject(new Error('Column not found'))),
          gte: jest.fn(() => Promise.resolve({ count: 0, data: [] })),
        })),
      }));

      const stats = await getAdminStats();

      expect(stats.bannedUsers).toBe(0);
    });
  });

  describe('getAllUsers', () => {
    const mockUsers = [
      { id: 'user-1', username: 'alice', role: 'member', created_at: '2024-01-01' },
      { id: 'user-2', username: 'bob', role: 'member', created_at: '2024-01-02' },
    ];

    it('should fetch all users with default pagination', async () => {
      const mockQuery = {
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({
            data: mockUsers,
            count: 2,
            error: null,
          })),
        })),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => mockQuery),
      });

      const result = await getAllUsers();

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should filter users by search query', async () => {
      const mockQuery = {
        or: jest.fn(function(this: typeof mockQuery) {
          return this;
        }),
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({
            data: [mockUsers[0]],
            count: 1,
            error: null,
          })),
        })),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => mockQuery),
      });

      const result = await getAllUsers({ search: 'alice' });

      expect(mockQuery.or).toHaveBeenCalledWith(expect.stringContaining('alice'));
      expect(result.users.length).toBe(1);
    });

    it('should filter users by role', async () => {
      const mockQuery = {
        eq: jest.fn(function(this: typeof mockQuery) {
          return this;
        }),
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({
            data: mockUsers,
            count: 2,
            error: null,
          })),
        })),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => mockQuery),
      });

      const result = await getAllUsers({ role: 'moderator' });

      expect(mockQuery.eq).toHaveBeenCalledWith('role', 'moderator');
    });

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({
              data: null,
              count: null,
              error: { message: 'Database error' },
            })),
          })),
        })),
      });

      await expect(getAllUsers()).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('getUser', () => {
    const mockUser = { id: 'user-1', username: 'testuser', role: 'member' };

    it('should fetch a single user by ID', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockUser,
              error: null,
            })),
          })),
        })),
      });

      const user = await getUser('user-1');

      expect(user).toEqual(mockUser);
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should throw error when user not found', async () => {
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

      await expect(getUser('nonexistent')).rejects.toThrow('User not found');
    });

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' },
            })),
          })),
        })),
      });

      await expect(getUser('user-1')).rejects.toThrow('Failed to fetch user');
    });
  });

  describe('updateUserRole', () => {
    it('should successfully update user role as admin', async () => {
      const updateMock = {
        eq: jest.fn(() => Promise.resolve({ error: null })),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            update: jest.fn(() => updateMock),
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { username: 'targetuser', role: 'member' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      await updateUserRole('user-456', 'moderator');

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should prevent non-admins from promoting to admin', async () => {
      const { withAdminAuth } = require('../auth/admin-check');
      withAdminAuth.mockImplementation((callback: (profile: typeof mockModeratorProfile) => unknown) => {
        return callback(mockModeratorProfile);
      });

      await expect(updateUserRole('user-456', 'admin')).rejects.toThrow(
        'Only administrators can promote users to admin'
      );
    });

    it('should prevent users from modifying their own role', async () => {
      await expect(updateUserRole('admin-123', 'member')).rejects.toThrow(
        'You cannot modify your own role'
      );
    });

    it('should enforce rate limiting', async () => {
      const { checkRateLimit } = require('../auth/utils');
      checkRateLimit.mockReturnValue(false);

      await expect(updateUserRole('user-456', 'moderator')).rejects.toThrow(
        'Rate limit exceeded'
      );
    });

    it('should log admin action and moderation log', async () => {
      const { logAdminAction } = require('../auth/admin-check');
      const { logModerationAction } = require('../actions/moderation-log');

      mockSupabase.from.mockImplementation(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { username: 'targetuser', role: 'member' },
              error: null,
            })),
          })),
        })),
      }));

      await updateUserRole('user-456', 'moderator');

      expect(logAdminAction).toHaveBeenCalledWith(
        'update_user_role',
        expect.objectContaining({ userId: 'user-456', newRole: 'moderator' }),
        mockAdminProfile
      );
      expect(logModerationAction).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user by default', async () => {
      const { logAdminAction } = require('../auth/admin-check');

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { role: 'member' },
              error: null,
            })),
          })),
        })),
      });

      await deleteUser('user-456', false);

      expect(logAdminAction).toHaveBeenCalledWith(
        'soft_delete_user',
        expect.objectContaining({ userId: 'user-456' }),
        mockAdminProfile
      );
    });

    it('should hard delete a user when specified', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { role: 'member' },
              error: null,
            })),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }));

      await deleteUser('user-456', true);

      const deleteCalls = mockSupabase.from.mock.results
        .map((r: { value: { delete?: () => unknown } }) => r.value)
        .filter((v: { delete?: () => unknown }) => v.delete);

      expect(deleteCalls.length).toBeGreaterThan(0);
    });

    it('should prevent users from deleting themselves', async () => {
      await expect(deleteUser('admin-123')).rejects.toThrow(
        'You cannot delete your own account'
      );
    });

    it('should prevent deletion of admin accounts', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { role: 'admin' },
              error: null,
            })),
          })),
        })),
      });

      await expect(deleteUser('other-admin')).rejects.toThrow(
        'Cannot delete administrator accounts'
      );
    });

    it('should prevent non-admins from hard deleting', async () => {
      const { withAdminAuth } = require('../auth/admin-check');
      withAdminAuth.mockImplementation((callback: (profile: typeof mockModeratorProfile) => unknown) => {
        return callback(mockModeratorProfile);
      });

      await expect(deleteUser('user-456', true)).rejects.toThrow(
        'Only administrators can perform hard deletes'
      );
    });

    it('should enforce rate limiting', async () => {
      const { checkRateLimit } = require('../auth/utils');
      checkRateLimit.mockReturnValue(false);

      await expect(deleteUser('user-456')).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('getRecentActivity', () => {
    it('should fetch and combine recent activities', async () => {
      const mockUsers = [
        { id: 'u1', username: 'alice', created_at: '2024-01-01' },
      ];

      const mockThreads = [
        {
          id: 't1',
          title: 'Test Thread',
          created_at: '2024-01-02',
          author: { username: 'bob' },
        },
      ];

      let fromCallIndex = 0;
      mockSupabase.from.mockImplementation((table: string) => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          // profiles query
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: mockUsers })),
              })),
            })),
          };
        } else {
          // threads query
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: mockThreads })),
              })),
            })),
          };
        }
      });

      const activities = await getRecentActivity(10);

      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeGreaterThan(0);
    });
  });

  describe('getTopContributors', () => {
    it('should fetch top contributors by post count', async () => {
      const mockContributors = [
        {
          id: 'u1',
          username: 'alice',
          post_count: 100,
          reputation: 500,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({
              data: mockContributors,
              error: null,
            })),
          })),
        })),
      });

      const contributors = await getTopContributors(5);

      expect(contributors).toEqual(mockContributors);
    });
  });

  describe('searchUsers', () => {
    it('should search users by username or display name', async () => {
      const mockResults = [
        { id: 'u1', username: 'testuser', display_name: 'Test User' },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          or: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({
              data: mockResults,
              error: null,
            })),
          })),
        })),
      });

      const results = await searchUsers('test', 20);

      expect(results).toEqual(mockResults);
    });
  });

  describe('bulkUpdateUserRoles', () => {
    it('should update multiple user roles at once', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          in: jest.fn(() => Promise.resolve({ error: null })),
        })),
      });

      const userIds = ['user-1', 'user-2', 'user-3'];
      await bulkUpdateUserRoles(userIds, 'moderator');

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should prevent bulk updating own role', async () => {
      const userIds = ['admin-123', 'user-2'];

      await expect(bulkUpdateUserRoles(userIds, 'member')).rejects.toThrow(
        'Cannot modify your own role in bulk operation'
      );
    });

    it('should limit bulk updates to 50 users', async () => {
      const userIds = Array.from({ length: 51 }, (_, i) => `user-${i}`);

      await expect(bulkUpdateUserRoles(userIds, 'member')).rejects.toThrow(
        'Cannot update more than 50 users at once'
      );
    });

    it('should prevent non-admins from bulk promoting to admin', async () => {
      const { withAdminAuth } = require('../auth/admin-check');
      withAdminAuth.mockImplementation((callback: (profile: typeof mockModeratorProfile) => unknown) => {
        return callback(mockModeratorProfile);
      });

      const userIds = ['user-1', 'user-2'];

      await expect(bulkUpdateUserRoles(userIds, 'admin')).rejects.toThrow(
        'Only administrators can promote users to admin'
      );
    });
  });
});
