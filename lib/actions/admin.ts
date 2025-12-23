'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  withAdminAuth,
  logAdminAction,
  type AdminActionResult,
} from '@/lib/auth/admin-check';
import { checkRateLimit } from '@/lib/auth/utils';
import type { UserRole } from '@/lib/supabase/database.types';
import { logModerationAction } from './moderation-log';
// Import types from separate file (Next.js 15/16 'use server' files can only export async functions)
import type {
  AdminStats,
  AdminUser,
  GetUsersFilters,
  ActivityItem,
  TopContributor,
} from './admin-types';

// Re-export types for consumers
export type { AdminStats, AdminUser, GetUsersFilters, ActivityItem, TopContributor } from './admin-types';

// Helper types for query results
type AuthorIdResult = { author_id: string };
type ThreadWithAuthorResult = {
  id: string;
  title: string;
  created_at: string;
  author: { username: string } | null;
};
type UserBasicResult = {
  id: string;
  username: string;
  created_at: string;
};
type UserRoleQueryResult = {
  username: string;
  role: UserRole;
};
type QueryError = { message: string; code?: string } | null;

/**
 * Get comprehensive dashboard statistics
 */
export async function getAdminStats(): Promise<AdminActionResult<AdminStats>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get total posts (threads + replies)
    const { count: totalThreads } = await supabase
      .from('threads')
      .select('*', { count: 'exact', head: true });

    const { count: totalReplies } = await supabase
      .from('replies')
      .select('*', { count: 'exact', head: true });

    // Get new users today
    const { count: newUsersToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get new threads today
    const { count: newThreadsToday } = await supabase
      .from('threads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get new replies today
    const { count: newRepliesToday } = await supabase
      .from('replies')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get active users today (users who posted or replied)
    const { data: activeThreadAuthors } = await supabase
      .from('threads')
      .select('author_id')
      .gte('created_at', today.toISOString());

    const { data: activeReplyAuthors } = await supabase
      .from('replies')
      .select('author_id')
      .gte('created_at', today.toISOString());

    const activeUserIds = new Set([
      ...((activeThreadAuthors as AuthorIdResult[] | null)?.map((t) => t.author_id) || []),
      ...((activeReplyAuthors as AuthorIdResult[] | null)?.map((r) => r.author_id) || []),
    ]);

    // Get banned users count (may fail if migration not applied)
    let bannedUsers = 0;
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_banned', true);
      bannedUsers = count || 0;
    } catch {
      // is_banned column may not exist yet
      console.log('is_banned column not found - run migrations');
    }

    // Get pending reports count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: pendingReportsCount } = await (supabase as any)
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const stats: AdminStats = {
      totalUsers: totalUsers || 0,
      totalPosts: (totalReplies || 0) + (totalThreads || 0),
      totalThreads: totalThreads || 0,
      activeToday: activeUserIds.size,
      pageViewsToday: 0, // TODO: Implement page view tracking
      newUsersToday: newUsersToday || 0,
      newPostsToday: (newRepliesToday || 0) + (newThreadsToday || 0),
      newThreadsToday: newThreadsToday || 0,
      pendingReports: pendingReportsCount || 0,
      bannedUsers: bannedUsers || 0,
    };

    return stats;
  });
}

/**
 * Get all users with filtering and pagination
 */
export async function getAllUsers(
  filters: GetUsersFilters = {}
): Promise<AdminActionResult<{ users: AdminUser[]; total: number }>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();
    const { search, role, limit = 50, offset = 0 } = filters;

    let query = supabase.from('profiles').select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, count, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return {
      users: users || [],
      total: count || 0,
    };
  });
}

/**
 * Get a single user by ID
 */
export async function getUser(userId: string): Promise<AdminActionResult<AdminUser>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  });
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`update-role-${adminProfile.id}`, 20, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before updating more roles.');
    }

    // Security: Only admins can promote to admin
    if (newRole === 'admin' && adminProfile.role !== 'admin') {
      throw new Error('Only administrators can promote users to admin');
    }

    // Security: Cannot modify own role
    if (userId === adminProfile.id) {
      throw new Error('You cannot modify your own role');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }

    // Get user info for logging
    const { data: userData } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', userId)
      .single() as { data: UserRoleQueryResult | null; error: QueryError };

    // Log admin action
    await logAdminAction('update_user_role', { userId, newRole }, adminProfile);
    await logModerationAction(
      'update_user_role',
      userId,
      'user',
      `Role changed from ${userData?.role || 'unknown'} to ${newRole}`,
      adminProfile,
      { newRole, username: userData?.username }
    );

    revalidatePath('/admin/users');
  });
}

/**
 * Delete user (soft delete by default)
 */
export async function deleteUser(
  userId: string,
  hardDelete = false
): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`delete-user-${adminProfile.id}`, 5, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before deleting more users.');
    }

    // Security: Cannot delete self
    if (userId === adminProfile.id) {
      throw new Error('You cannot delete your own account');
    }

    // Only admins can perform hard deletes
    if (hardDelete && adminProfile.role !== 'admin') {
      throw new Error('Only administrators can perform hard deletes');
    }

    // Get target user
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single() as { data: { role: UserRole } | null; error: QueryError };

    // Cannot delete admins
    if (targetUser?.role === 'admin') {
      throw new Error('Cannot delete administrator accounts');
    }

    // Only admins can delete moderators
    if (targetUser?.role === 'moderator' && adminProfile.role !== 'admin') {
      throw new Error('Only administrators can delete moderators');
    }

    if (hardDelete) {
      // Hard delete - remove from database
      // This will cascade to threads, replies, etc. based on your DB constraints
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }

      await logAdminAction('hard_delete_user', { userId }, adminProfile);
    } else {
      // Soft delete - mark as deleted
      // TODO: Add deleted_at column to profiles table
      await logAdminAction('soft_delete_user', { userId }, adminProfile);
    }

    revalidatePath('/admin/users');
  });
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(
  limit = 10
): Promise<AdminActionResult<ActivityItem[]>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();
    const activities: ActivityItem[] = [];

    // Get recent users
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, username, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentUsers) {
      (recentUsers as UserBasicResult[]).forEach((user) => {
        activities.push({
          id: user.id,
          type: 'user',
          message: `New user registered: ${user.username}`,
          timestamp: user.created_at,
          userId: user.id,
          username: user.username,
        });
      });
    }

    // Get recent threads
    const { data: recentThreads } = await supabase
      .from('threads')
      .select('id, title, created_at, author:profiles!author_id(username)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentThreads) {
      (recentThreads as unknown as ThreadWithAuthorResult[]).forEach((thread) => {
        activities.push({
          id: thread.id,
          type: 'thread',
          message: `New thread: "${thread.title}"`,
          timestamp: thread.created_at,
          username: thread.author?.username,
        });
      });
    }

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, limit);
  });
}

/**
 * Get top contributors
 */
export async function getTopContributors(
  limit = 5
): Promise<AdminActionResult<TopContributor[]>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();

    const { data: topUsers, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, post_count, reputation')
      .order('post_count', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch top contributors: ${error.message}`);
    }

    return topUsers || [];
  });
}

/**
 * Search users for admin panel
 */
export async function searchUsers(
  query: string,
  limit = 20
): Promise<AdminActionResult<AdminUser[]>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();

    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }

    return users || [];
  });
}

/**
 * Bulk update user roles
 */
export async function bulkUpdateUserRoles(
  userIds: string[],
  newRole: UserRole
): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Security checks
    if (userIds.includes(adminProfile.id)) {
      throw new Error('Cannot modify your own role in bulk operation');
    }

    if (userIds.length > 50) {
      throw new Error('Cannot update more than 50 users at once');
    }

    if (newRole === 'admin' && adminProfile.role !== 'admin') {
      throw new Error('Only administrators can promote users to admin');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .in('id', userIds);

    if (error) {
      throw new Error(`Failed to bulk update roles: ${error.message}`);
    }

    await logAdminAction(
      'bulk_update_roles',
      { userIds, newRole, count: userIds.length },
      adminProfile
    );

    revalidatePath('/admin/users');
  });
}
