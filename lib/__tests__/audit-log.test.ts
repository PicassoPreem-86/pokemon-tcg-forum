/**
 * Admin Audit Log Tests
 *
 * Tests for admin audit logging functionality including:
 * - Persistent logging to database
 * - Audit log retrieval and filtering
 * - Statistics and activity tracking
 *
 * Run with: npm test audit-log.test.ts
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getAuditLogs, getRecentAuditActivity, getAuditLogStats } from '../actions/audit-log';
import { logAdminAction } from '../auth/admin-check';

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => Promise.resolve({
    get: jest.fn((key: string) => {
      if (key === 'x-forwarded-for') return '192.168.1.1';
      if (key === 'user-agent') return 'Mozilla/5.0 Test Browser';
      return null;
    }),
  })),
}));

// Create mock Supabase client
const createMockSupabaseClient = () => {
  const mockClient = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null })),
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null })),
            })),
          })),
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null })),
          })),
        })),
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null })),
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  };
  return mockClient;
};

// Mock Supabase server
jest.mock('../supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Admin Audit Log', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  const mockAdminProfile = {
    id: 'admin-123',
    username: 'testadmin',
    display_name: 'Test Admin',
    role: 'admin' as const,
    email: 'admin@example.com',
    avatar_url: null,
    bio: null,
    location: null,
    signature: null,
    post_count: 0,
    reputation: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_seen_at: null,
    is_banned: false,
    banned_at: null,
    banned_reason: null,
    banned_until: null,
    is_suspended: false,
    suspended_at: null,
    suspended_reason: null,
    suspended_until: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabaseClient();

    const { createClient } = require('../supabase/server');
    createClient.mockResolvedValue(mockSupabase);

    // Setup authenticated admin user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123', email: 'admin@example.com' } },
      error: null,
    });

    // Mock profile lookup for admin check
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: mockAdminProfile,
                error: null,
              })),
            })),
          })),
        };
      }
      if (table === 'admin_audit_log') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                range: jest.fn(() => Promise.resolve({
                  data: [],
                  count: 0,
                  error: null,
                })),
                limit: jest.fn(() => Promise.resolve({
                  data: [],
                  error: null,
                })),
              })),
            })),
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                order: jest.fn(() => ({
                  range: jest.fn(() => Promise.resolve({
                    data: [],
                    count: 0,
                    error: null,
                  })),
                })),
              })),
              order: jest.fn(() => ({
                range: jest.fn(() => Promise.resolve({
                  data: [],
                  count: 0,
                  error: null,
                })),
              })),
            })),
            order: jest.fn(() => ({
              range: jest.fn(() => Promise.resolve({
                data: [],
                count: 0,
                error: null,
              })),
              limit: jest.fn(() => Promise.resolve({
                data: [],
                error: null,
              })),
            })),
          })),
          insert: jest.fn(() => Promise.resolve({ error: null })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
        insert: jest.fn(() => Promise.resolve({ error: null })),
      };
    });
  });

  describe('logAdminAction', () => {
    it('should log admin action to database with IP and user agent', async () => {
      let capturedLogEntry: Record<string, unknown> | null = null;

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockAdminProfile,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'admin_audit_log') {
          return {
            insert: jest.fn((data: Record<string, unknown>) => {
              capturedLogEntry = data;
              return Promise.resolve({ error: null });
            }),
          };
        }
        return {
          insert: jest.fn(() => Promise.resolve({ error: null })),
        };
      });

      await logAdminAction(
        'update_user_role',
        { userId: 'user-456', newRole: 'moderator' },
        mockAdminProfile
      );

      expect(capturedLogEntry).not.toBeNull();
      expect(capturedLogEntry?.admin_id).toBe('admin-123');
      expect(capturedLogEntry?.action).toBe('update_user_role');
      expect(capturedLogEntry?.details).toEqual({ userId: 'user-456', newRole: 'moderator' });
      expect(capturedLogEntry?.ip_address).toBe('192.168.1.1');
      expect(capturedLogEntry?.user_agent).toBe('Mozilla/5.0 Test Browser');
      expect(capturedLogEntry?.created_at).toBeDefined();
    });

    it('should handle database errors gracefully without throwing', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockAdminProfile,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'admin_audit_log') {
          return {
            insert: jest.fn(() => Promise.resolve({
              error: { message: 'Database connection failed' },
            })),
          };
        }
        return {
          insert: jest.fn(() => Promise.resolve({ error: null })),
        };
      });

      // Should not throw, just log to console
      await expect(
        logAdminAction('test_action', { test: true }, mockAdminProfile)
      ).resolves.not.toThrow();
    });

    it('should serialize complex objects in details', async () => {
      let capturedLogEntry: Record<string, unknown> | null = null;

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockAdminProfile,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'admin_audit_log') {
          return {
            insert: jest.fn((data: Record<string, unknown>) => {
              capturedLogEntry = data;
              return Promise.resolve({ error: null });
            }),
          };
        }
        return {
          insert: jest.fn(() => Promise.resolve({ error: null })),
        };
      });

      const complexDetails = {
        userIds: ['user-1', 'user-2', 'user-3'],
        metadata: { count: 3, operation: 'bulk' },
        timestamp: new Date().toISOString(),
      };

      await logAdminAction('bulk_update_roles', complexDetails, mockAdminProfile);

      expect(capturedLogEntry).not.toBeNull();
      expect(capturedLogEntry?.details).toEqual(complexDetails);
    });
  });

  describe('getAuditLogs', () => {
    it('should require admin authentication', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getAuditLogs();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should reject non-admin users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'user@example.com' } },
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { ...mockAdminProfile, role: 'member' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null })),
            })),
          })),
        };
      });

      const result = await getAuditLogs();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Admin or moderator access required');
    });

    it('should return audit logs for authenticated admin', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          admin_id: 'admin-123',
          action: 'update_user_role',
          details: { userId: 'user-1', newRole: 'moderator' },
          ip_address: '192.168.1.1',
          user_agent: 'Test Browser',
          created_at: new Date().toISOString(),
          admin: { username: 'testadmin', display_name: 'Test Admin', avatar_url: null },
        },
        {
          id: 'log-2',
          admin_id: 'admin-123',
          action: 'bulk_update_roles',
          details: { userIds: ['user-1', 'user-2'], newRole: 'member' },
          ip_address: '192.168.1.1',
          user_agent: 'Test Browser',
          created_at: new Date().toISOString(),
          admin: { username: 'testadmin', display_name: 'Test Admin', avatar_url: null },
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockAdminProfile,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'admin_audit_log') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                range: jest.fn(() => Promise.resolve({
                  data: mockLogs,
                  count: 2,
                  error: null,
                })),
              })),
            })),
          };
        }
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null })),
            })),
          })),
        };
      });

      const result = await getAuditLogs();

      expect(result.success).toBe(true);
      expect(result.data?.logs).toHaveLength(2);
      expect(result.data?.total).toBe(2);
      expect(result.data?.logs[0].action).toBe('update_user_role');
    });

    it('should apply filters correctly', async () => {
      let capturedFilters: { adminId?: string; action?: string } = {};

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockAdminProfile,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'admin_audit_log') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn((field: string, value: string) => {
                if (field === 'admin_id') capturedFilters.adminId = value;
                if (field === 'action') capturedFilters.action = value;
                return {
                  eq: jest.fn(() => ({
                    order: jest.fn(() => ({
                      range: jest.fn(() => Promise.resolve({
                        data: [],
                        count: 0,
                        error: null,
                      })),
                    })),
                  })),
                  order: jest.fn(() => ({
                    range: jest.fn(() => Promise.resolve({
                      data: [],
                      count: 0,
                      error: null,
                    })),
                  })),
                };
              }),
            })),
          };
        }
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null })),
            })),
          })),
        };
      });

      await getAuditLogs({
        adminId: 'admin-123',
        action: 'update_user_role',
        limit: 10,
        offset: 0,
      });

      expect(capturedFilters.adminId).toBe('admin-123');
    });
  });

  describe('getRecentAuditActivity', () => {
    it('should return recent audit logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          admin_id: 'admin-123',
          action: 'update_user_role',
          details: {},
          created_at: new Date().toISOString(),
          admin: { username: 'testadmin' },
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockAdminProfile,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'admin_audit_log') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({
                  data: mockLogs,
                  error: null,
                })),
              })),
            })),
          };
        }
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        };
      });

      const result = await getRecentAuditActivity(5);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getAuditLogStats', () => {
    it('should return audit log statistics', async () => {
      const mockActionCounts = [
        { action: 'update_user_role' },
        { action: 'update_user_role' },
        { action: 'bulk_update_roles' },
        { action: 'hard_delete_user' },
      ];

      let callCount = 0;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockAdminProfile,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'admin_audit_log') {
          callCount++;
          // First call: count query
          if (callCount === 1) {
            return {
              select: jest.fn(() => Promise.resolve({
                count: 4,
                error: null,
              })),
            };
          }
          // Second call: action counts
          if (callCount === 2) {
            return {
              select: jest.fn(() => Promise.resolve({
                data: mockActionCounts,
                error: null,
              })),
            };
          }
          // Third call: recent activity
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({
                  data: [],
                  error: null,
                })),
              })),
            })),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null })),
        };
      });

      const result = await getAuditLogStats();

      expect(result.success).toBe(true);
      expect(result.data?.totalActions).toBe(4);
      expect(result.data?.actionsByType['update_user_role']).toBe(2);
      expect(result.data?.actionsByType['bulk_update_roles']).toBe(1);
      expect(result.data?.actionsByType['hard_delete_user']).toBe(1);
    });
  });
});
