'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  withAdminAuth,
  logAdminAction,
  type AdminActionResult,
} from '@/lib/auth/admin-check';
import { checkRateLimit } from '@/lib/auth/utils';
import { logModerationAction } from './moderation-log';
import type {
  AdminContentItem,
  GetContentFilters,
  ContentStats,
  ContentActionResult,
} from './action-types';

// Re-export types
export type { AdminContentItem, GetContentFilters, ContentStats, ContentActionResult } from './action-types';

// Helper types for Supabase query results
interface ThreadQueryResult {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  author_id: string;
  category_id: string | null;
  view_count: number;
  post_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  author: { username: string; avatar_url: string | null } | null;
  category: { name: string; slug: string } | null;
}

interface ReplyQueryResult {
  id: string;
  thread_id: string;
  content: string;
  author_id: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  author: { username: string; avatar_url: string | null } | null;
  thread: {
    title: string;
    slug: string;
    category_id: string | null;
    is_locked: boolean;
    categories: { name: string; slug: string } | null;
  } | null;
}

interface ReportCountResult {
  target_id: string;
}

/**
 * Get content (threads and/or replies) for admin management
 */
export async function getAdminContent(
  filters: GetContentFilters = {}
): Promise<AdminActionResult<{ content: AdminContentItem[]; total: number }>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();
    const {
      type,
      status = 'all',
      search,
      categoryId,
      hasReports,
      limit = 50,
      offset = 0,
    } = filters;

    const content: AdminContentItem[] = [];
    let totalCount = 0;

    // Fetch threads if type is 'thread' or not specified
    if (!type || type === 'thread') {
      let threadQuery = supabase
        .from('threads')
        .select(`
          id,
          slug,
          title,
          content,
          excerpt,
          author_id,
          category_id,
          view_count,
          post_count,
          is_pinned,
          is_locked,
          deleted_at,
          created_at,
          updated_at,
          author:profiles!author_id(username, avatar_url),
          category:categories!category_id(name, slug)
        `, { count: 'exact' });

      // Apply filters
      if (status === 'deleted') {
        threadQuery = threadQuery.not('deleted_at', 'is', null);
      } else if (status === 'active') {
        threadQuery = threadQuery.is('deleted_at', null).eq('is_locked', false);
      } else if (status === 'flagged') {
        // Flagged = has pending reports
        // We'll filter this after fetching
      } else {
        // 'all' - include everything
      }

      if (search) {
        threadQuery = threadQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      if (categoryId) {
        threadQuery = threadQuery.eq('category_id', categoryId);
      }

      threadQuery = threadQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: threadsData, count: threadCount, error: threadError } = await threadQuery;
      const threads = threadsData as ThreadQueryResult[] | null;

      if (threadError) {
        console.error('Error fetching threads:', threadError);
      } else if (threads && threads.length > 0) {
        // Get report counts for threads
        const threadIds = threads.map(t => t.id);
        const { data: reportCountsData } = await supabase
          .from('reports')
          .select('target_id')
          .eq('target_type', 'thread')
          .eq('status', 'pending')
          .in('target_id', threadIds);
        const reportCounts = reportCountsData as ReportCountResult[] | null;

        const reportCountMap: Record<string, number> = {};
        reportCounts?.forEach(r => {
          reportCountMap[r.target_id] = (reportCountMap[r.target_id] || 0) + 1;
        });

        for (const thread of threads) {
          const author = thread.author;
          const category = thread.category;
          const reportCount = reportCountMap[thread.id] || 0;

          // Skip if filtering by hasReports and this has none
          if (hasReports && reportCount === 0) continue;
          // Skip if filtering by flagged and has no reports
          if (status === 'flagged' && reportCount === 0) continue;

          content.push({
            id: thread.id,
            type: 'thread',
            title: thread.title,
            content: thread.content,
            excerpt: thread.excerpt || thread.content.substring(0, 150) + '...',
            author_id: thread.author_id,
            author_username: author?.username || 'Unknown',
            author_avatar: author?.avatar_url || null,
            category_id: thread.category_id,
            category_name: category?.name || null,
            category_slug: category?.slug || null,
            thread_id: null,
            thread_slug: null,
            is_pinned: thread.is_pinned,
            is_locked: thread.is_locked,
            view_count: thread.view_count,
            reply_count: thread.post_count - 1, // post_count includes OP
            report_count: reportCount,
            created_at: thread.created_at,
            updated_at: thread.updated_at,
            deleted_at: thread.deleted_at,
          });
        }

        totalCount += threadCount || 0;
      }
    }

    // Fetch replies if type is 'reply' or not specified
    if (!type || type === 'reply') {
      let replyQuery = supabase
        .from('replies')
        .select(`
          id,
          thread_id,
          content,
          author_id,
          deleted_at,
          created_at,
          updated_at,
          author:profiles!author_id(username, avatar_url),
          thread:threads!thread_id(title, slug, category_id, is_locked, categories!category_id(name, slug))
        `, { count: 'exact' });

      // Apply filters
      if (status === 'deleted') {
        replyQuery = replyQuery.not('deleted_at', 'is', null);
      } else if (status === 'active') {
        replyQuery = replyQuery.is('deleted_at', null);
      }

      if (search) {
        replyQuery = replyQuery.ilike('content', `%${search}%`);
      }

      replyQuery = replyQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: repliesData, count: replyCount, error: replyError } = await replyQuery;
      const replies = repliesData as ReplyQueryResult[] | null;

      if (replyError) {
        console.error('Error fetching replies:', replyError);
      } else if (replies && replies.length > 0) {
        // Get report counts for replies
        const replyIds = replies.map(r => r.id);
        const { data: replyReportCountsData } = await supabase
          .from('reports')
          .select('target_id')
          .eq('target_type', 'reply')
          .eq('status', 'pending')
          .in('target_id', replyIds);
        const replyReportCounts = replyReportCountsData as ReportCountResult[] | null;

        const reportCountMap: Record<string, number> = {};
        replyReportCounts?.forEach(r => {
          reportCountMap[r.target_id] = (reportCountMap[r.target_id] || 0) + 1;
        });

        for (const reply of replies) {
          const author = reply.author;
          const thread = reply.thread;
          const reportCount = reportCountMap[reply.id] || 0;

          // Skip if filtering by hasReports and this has none
          if (hasReports && reportCount === 0) continue;
          // Skip if filtering by flagged and has no reports
          if (status === 'flagged' && reportCount === 0) continue;

          content.push({
            id: reply.id,
            type: 'reply',
            title: `Re: ${thread?.title || 'Unknown Thread'}`,
            content: reply.content,
            excerpt: reply.content.substring(0, 150) + (reply.content.length > 150 ? '...' : ''),
            author_id: reply.author_id,
            author_username: author?.username || 'Unknown',
            author_avatar: author?.avatar_url || null,
            category_id: thread?.category_id || null,
            category_name: thread?.categories?.name || null,
            category_slug: thread?.categories?.slug || null,
            thread_id: reply.thread_id,
            thread_slug: thread?.slug || null,
            is_pinned: false,
            is_locked: thread?.is_locked || false,
            view_count: 0,
            reply_count: 0,
            report_count: reportCount,
            created_at: reply.created_at,
            updated_at: reply.updated_at,
            deleted_at: reply.deleted_at,
          });
        }

        totalCount += replyCount || 0;
      }
    }

    // Sort combined content by created_at
    content.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      content: content.slice(0, limit),
      total: totalCount,
    };
  });
}

/**
 * Get content statistics for dashboard
 */
export async function getContentStats(): Promise<AdminActionResult<ContentStats>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get thread counts
    const { count: totalThreads } = await supabase
      .from('threads')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Get reply counts
    const { count: totalReplies } = await supabase
      .from('replies')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Get flagged content count (content with pending reports)
    const { count: flaggedThreads } = await supabase
      .from('reports')
      .select('target_id', { count: 'exact', head: true })
      .eq('target_type', 'thread')
      .eq('status', 'pending');

    const { count: flaggedReplies } = await supabase
      .from('reports')
      .select('target_id', { count: 'exact', head: true })
      .eq('target_type', 'reply')
      .eq('status', 'pending');

    // Get deleted today
    const { count: deletedThreadsToday } = await supabase
      .from('threads')
      .select('*', { count: 'exact', head: true })
      .gte('deleted_at', today.toISOString());

    const { count: deletedRepliesToday } = await supabase
      .from('replies')
      .select('*', { count: 'exact', head: true })
      .gte('deleted_at', today.toISOString());

    return {
      totalThreads: totalThreads || 0,
      totalReplies: totalReplies || 0,
      flaggedContent: (flaggedThreads || 0) + (flaggedReplies || 0),
      deletedToday: (deletedThreadsToday || 0) + (deletedRepliesToday || 0),
    };
  });
}

/**
 * Pin or unpin a thread
 */
export async function toggleThreadPin(
  threadId: string,
  pin: boolean
): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`pin-thread-${adminProfile.id}`, 30, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before pinning more threads.');
    }

    const { error } = await (supabase as any)
      .from('threads')
      .update({ is_pinned: pin, updated_at: new Date().toISOString() })
      .eq('id', threadId);

    if (error) {
      throw new Error(`Failed to ${pin ? 'pin' : 'unpin'} thread: ${error.message}`);
    }

    // Log action
    await logAdminAction(pin ? 'pin_thread' : 'unpin_thread', { threadId }, adminProfile);
    await logModerationAction(
      pin ? 'pin_thread' : 'unpin_thread',
      threadId,
      'thread',
      `Thread ${pin ? 'pinned' : 'unpinned'}`,
      adminProfile
    );

    revalidatePath('/admin/content');
  });
}

/**
 * Lock or unlock a thread
 */
export async function toggleThreadLock(
  threadId: string,
  lock: boolean
): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`lock-thread-${adminProfile.id}`, 30, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before locking more threads.');
    }

    const { error } = await (supabase as any)
      .from('threads')
      .update({ is_locked: lock, updated_at: new Date().toISOString() })
      .eq('id', threadId);

    if (error) {
      throw new Error(`Failed to ${lock ? 'lock' : 'unlock'} thread: ${error.message}`);
    }

    // Log action
    await logAdminAction(lock ? 'lock_thread' : 'unlock_thread', { threadId }, adminProfile);
    await logModerationAction(
      lock ? 'lock_thread' : 'unlock_thread',
      threadId,
      'thread',
      `Thread ${lock ? 'locked' : 'unlocked'}`,
      adminProfile
    );

    revalidatePath('/admin/content');
  });
}

/**
 * Soft delete a thread
 */
export async function deleteThread(
  threadId: string,
  reason?: string
): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`delete-thread-${adminProfile.id}`, 10, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before deleting more threads.');
    }

    const { error } = await (supabase as any)
      .from('threads')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: adminProfile.id,
        deleted_reason: reason || 'Deleted by moderator',
        updated_at: new Date().toISOString(),
      })
      .eq('id', threadId);

    if (error) {
      throw new Error(`Failed to delete thread: ${error.message}`);
    }

    // Log action
    await logAdminAction('delete_thread', { threadId, reason }, adminProfile);
    await logModerationAction(
      'delete_thread',
      threadId,
      'thread',
      reason || 'Deleted by moderator',
      adminProfile
    );

    revalidatePath('/admin/content');
  });
}

/**
 * Restore a deleted thread
 */
export async function restoreThread(threadId: string): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    const { error } = await (supabase as any)
      .from('threads')
      .update({
        deleted_at: null,
        deleted_by: null,
        deleted_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', threadId);

    if (error) {
      throw new Error(`Failed to restore thread: ${error.message}`);
    }

    // Log action
    await logAdminAction('restore_thread', { threadId }, adminProfile);
    await logModerationAction(
      'restore_thread',
      threadId,
      'thread',
      'Thread restored',
      adminProfile
    );

    revalidatePath('/admin/content');
  });
}

/**
 * Soft delete a reply
 */
export async function deleteReply(
  replyId: string,
  reason?: string
): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`delete-reply-${adminProfile.id}`, 20, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before deleting more replies.');
    }

    const { error } = await (supabase as any)
      .from('replies')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: adminProfile.id,
        deleted_reason: reason || 'Deleted by moderator',
        updated_at: new Date().toISOString(),
      })
      .eq('id', replyId);

    if (error) {
      throw new Error(`Failed to delete reply: ${error.message}`);
    }

    // Log action
    await logAdminAction('delete_reply', { replyId, reason }, adminProfile);
    await logModerationAction(
      'delete_reply',
      replyId,
      'reply',
      reason || 'Deleted by moderator',
      adminProfile
    );

    revalidatePath('/admin/content');
  });
}

/**
 * Restore a deleted reply
 */
export async function restoreReply(replyId: string): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    const { error } = await (supabase as any)
      .from('replies')
      .update({
        deleted_at: null,
        deleted_by: null,
        deleted_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', replyId);

    if (error) {
      throw new Error(`Failed to restore reply: ${error.message}`);
    }

    // Log action
    await logAdminAction('restore_reply', { replyId }, adminProfile);
    await logModerationAction(
      'restore_reply',
      replyId,
      'reply',
      'Reply restored',
      adminProfile
    );

    revalidatePath('/admin/content');
  });
}

/**
 * Bulk delete content
 */
export async function bulkDeleteContent(
  items: Array<{ id: string; type: 'thread' | 'reply' }>,
  reason?: string
): Promise<AdminActionResult<{ deleted: number; failed: number }>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    if (items.length > 50) {
      throw new Error('Cannot delete more than 50 items at once');
    }

    let deleted = 0;
    let failed = 0;

    const threadIds = items.filter(i => i.type === 'thread').map(i => i.id);
    const replyIds = items.filter(i => i.type === 'reply').map(i => i.id);

    // Delete threads
    if (threadIds.length > 0) {
      const { error } = await (supabase as any)
        .from('threads')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: adminProfile.id,
          deleted_reason: reason || 'Bulk deleted by moderator',
          updated_at: new Date().toISOString(),
        })
        .in('id', threadIds);

      if (error) {
        failed += threadIds.length;
      } else {
        deleted += threadIds.length;
      }
    }

    // Delete replies
    if (replyIds.length > 0) {
      const { error } = await (supabase as any)
        .from('replies')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: adminProfile.id,
          deleted_reason: reason || 'Bulk deleted by moderator',
          updated_at: new Date().toISOString(),
        })
        .in('id', replyIds);

      if (error) {
        failed += replyIds.length;
      } else {
        deleted += replyIds.length;
      }
    }

    // Log action
    await logAdminAction('bulk_delete_content', {
      threadCount: threadIds.length,
      replyCount: replyIds.length,
      reason,
    }, adminProfile);

    revalidatePath('/admin/content');

    return { deleted, failed };
  });
}

/**
 * Bulk lock threads
 */
export async function bulkLockThreads(
  threadIds: string[],
  lock: boolean
): Promise<AdminActionResult<{ updated: number; failed: number }>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    if (threadIds.length > 50) {
      throw new Error('Cannot update more than 50 threads at once');
    }

    const { error, count } = await (supabase as any)
      .from('threads')
      .update({
        is_locked: lock,
        updated_at: new Date().toISOString(),
      })
      .in('id', threadIds);

    if (error) {
      throw new Error(`Failed to bulk ${lock ? 'lock' : 'unlock'} threads: ${error.message}`);
    }

    // Log action
    await logAdminAction(lock ? 'bulk_lock_threads' : 'bulk_unlock_threads', {
      count: threadIds.length,
    }, adminProfile);

    revalidatePath('/admin/content');

    return {
      updated: count || threadIds.length,
      failed: 0,
    };
  });
}
