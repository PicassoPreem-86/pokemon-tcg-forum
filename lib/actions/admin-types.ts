// Admin types - separate file because 'use server' files can only export async functions

import type { UserRole, Profile } from '@/lib/supabase/database.types';

/**
 * Admin Dashboard Statistics
 */
export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalThreads: number;
  activeToday: number;
  pageViewsToday: number;
  newUsersToday: number;
  newPostsToday: number;
  newThreadsToday: number;
  pendingReports: number;
  bannedUsers: number;
}

/**
 * User list with filters
 */
export interface AdminUser extends Profile {
  last_active?: string;
}

export interface GetUsersFilters {
  search?: string;
  role?: UserRole;
  limit?: number;
  offset?: number;
}

/**
 * Activity item for dashboard
 */
export interface ActivityItem {
  id: string;
  type: 'user' | 'post' | 'thread' | 'report';
  message: string;
  timestamp: string;
  userId?: string;
  username?: string;
}

/**
 * Top contributor for dashboard
 */
export interface TopContributor {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  post_count: number;
  reputation: number;
}
