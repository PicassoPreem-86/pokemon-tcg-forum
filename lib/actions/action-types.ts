// Action types - separate file because 'use server' files can only export async functions
// This file contains all interface and type exports for server action files

import type { Thread, Category, Profile, ModerationLog, UserRole } from '@/lib/supabase/database.types';

// ============================================
// Bookmark Types
// ============================================

export interface BookmarkResult {
  success: boolean;
  error?: string;
  isBookmarked?: boolean;
}

export interface BookmarkedThreadData {
  id: string;
  user_id: string;
  thread_id: string;
  created_at: string;
  thread: Thread & {
    category: Category;
    author: Profile;
  };
}

// ============================================
// Notification Types
// ============================================

export interface NotificationResult {
  success: boolean;
  error?: string;
  notificationId?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'reply' | 'mention' | 'like' | 'follow' | 'badge';
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  actor?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

// ============================================
// Reply Types
// ============================================

export interface ReplyResult {
  success: boolean;
  error?: string;
  replyId?: string;
}

// ============================================
// Thread Types
// ============================================

export interface ThreadResult {
  success: boolean;
  error?: string;
  threadSlug?: string;
}

// ============================================
// Moderation Types
// ============================================

export type ModerationAction =
  | 'ban_user'
  | 'unban_user'
  | 'suspend_user'
  | 'unsuspend_user'
  | 'delete_thread'
  | 'delete_reply'
  | 'lock_thread'
  | 'unlock_thread'
  | 'pin_thread'
  | 'unpin_thread'
  | 'update_user_role';

export type ModerationTargetType = 'user' | 'thread' | 'reply';

export interface GetModerationLogsFilters {
  moderatorId?: string;
  targetType?: ModerationTargetType;
  targetId?: string;
  action?: ModerationAction;
  limit?: number;
  offset?: number;
}

export interface ModerationStats {
  totalActions: number;
  bans: number;
  suspensions: number;
  deletions: number;
  locks: number;
  pins: number;
  recentActivity: ModerationLog[];
}

// ============================================
// Admin Moderation Data Types
// ============================================

// Type for user data from queries (includes moderation fields)
export interface UserModerationData {
  role: UserRole;
  username: string;
  is_banned?: boolean;
  is_suspended?: boolean;
}

// Type for thread data from moderation queries
export interface ThreadModerationData {
  id: string;
  title: string;
  author_id?: string;
  deleted_at?: string | null;
  is_locked?: boolean;
  is_pinned?: boolean;
}

// Type for reply data from moderation queries
export interface ReplyModerationData {
  id: string;
  thread_id: string;
  author_id?: string;
  deleted_at?: string | null;
}
