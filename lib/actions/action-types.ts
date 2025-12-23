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
  | 'restore_thread'
  | 'restore_reply'
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

// ============================================
// Admin Audit Log Types
// ============================================

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface GetAuditLogsFilters {
  adminId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogStats {
  totalActions: number;
  actionsByType: Record<string, number>;
  recentActivity: AdminAuditLog[];
}

// ============================================
// Report Types
// ============================================

export type ReportReason = 'spam' | 'harassment' | 'offensive' | 'scam' | 'illegal' | 'other';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportPriority = 'low' | 'medium' | 'high';
export type ReportTargetType = 'user' | 'thread' | 'reply';

export interface SubmitReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}

export interface ReportResult {
  success: boolean;
  error?: string;
  reportId?: string;
}

export interface ReportWithContent {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  priority: ReportPriority;
  moderator_id: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  reporter?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  moderator?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  // Content data (fetched based on target_type)
  content?: {
    title?: string;
    excerpt?: string;
    author_username?: string;
    author_avatar?: string;
    category_name?: string;
  };
}

export interface GetReportsFilters {
  status?: ReportStatus;
  reason?: ReportReason;
  priority?: ReportPriority;
  targetType?: ReportTargetType;
  reporterId?: string;
  moderatorId?: string;
  limit?: number;
  offset?: number;
}

export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  highPriorityPending: number;
  resolvedToday: number;
  byReason: Record<string, number>;
  byStatus: Record<string, number>;
}

// ============================================
// Admin Content Types
// ============================================

export type ContentType = 'thread' | 'reply';
export type ContentStatus = 'active' | 'flagged' | 'deleted' | 'locked';

export interface AdminContentItem {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  author_username: string;
  author_avatar: string | null;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  thread_id: string | null; // For replies, the parent thread
  thread_slug: string | null; // For replies, the parent thread slug
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  report_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GetContentFilters {
  type?: ContentType;
  status?: 'all' | 'active' | 'flagged' | 'deleted';
  search?: string;
  categoryId?: string;
  authorId?: string;
  hasReports?: boolean;
  limit?: number;
  offset?: number;
}

export interface ContentStats {
  totalThreads: number;
  totalReplies: number;
  flaggedContent: number;
  deletedToday: number;
}

export interface ContentActionResult {
  success: boolean;
  error?: string;
}
