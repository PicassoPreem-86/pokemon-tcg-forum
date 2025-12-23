'use server';

import { createClient } from '@/lib/supabase/server';
import { withAdminAuth, logAdminAction } from '@/lib/auth/admin-check';
import type { AdminActionResult } from '@/lib/auth/admin-check';
import type {
  SubmitReportInput,
  ReportResult,
  ReportWithContent,
  GetReportsFilters,
  ReportStats,
  ReportStatus,
  ReportPriority,
} from './action-types';

// Re-export types for consumers
export type {
  SubmitReportInput,
  ReportResult,
  ReportWithContent,
  GetReportsFilters,
  ReportStats,
  ReportStatus,
  ReportPriority,
  ReportReason,
  ReportTargetType,
} from './action-types';

// Priority mapping based on reason
const REASON_PRIORITY: Record<string, ReportPriority> = {
  scam: 'high',
  illegal: 'high',
  harassment: 'medium',
  spam: 'medium',
  offensive: 'low',
  other: 'medium',
};

/**
 * Submit a new report (user action)
 * Any authenticated user can submit a report
 */
export async function submitReport(input: SubmitReportInput): Promise<ReportResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to submit a report' };
    }

    // Prevent self-reporting for users
    if (input.targetType === 'user' && input.targetId === user.id) {
      return { success: false, error: 'You cannot report yourself' };
    }

    // Check if user has already reported this content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingReport } = await (supabase as any)
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('target_type', input.targetType)
      .eq('target_id', input.targetId)
      .eq('status', 'pending')
      .single();

    if (existingReport) {
      return { success: false, error: 'You have already reported this content' };
    }

    // Calculate priority based on reason
    const priority = REASON_PRIORITY[input.reason] || 'medium';

    // Insert the report
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: report, error } = await (supabase as any)
      .from('reports')
      .insert({
        reporter_id: user.id,
        target_type: input.targetType,
        target_id: input.targetId,
        reason: input.reason,
        details: input.details || null,
        priority,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error submitting report:', error);
      return { success: false, error: 'Failed to submit report' };
    }

    return { success: true, reportId: report.id };
  } catch (error) {
    console.error('Error in submitReport:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get reports with filtering (admin only)
 */
export async function getReports(
  filters: GetReportsFilters = {}
): Promise<AdminActionResult<{ reports: ReportWithContent[]; total: number }>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();
    const {
      status,
      reason,
      priority,
      targetType,
      limit = 50,
      offset = 0,
    } = filters;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('reports')
      .select(`
        *,
        reporter:profiles!reporter_id(username, display_name, avatar_url),
        moderator:profiles!moderator_id(username, display_name, avatar_url)
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (reason) {
      query = query.eq('reason', reason);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (targetType) {
      query = query.eq('target_type', targetType);
    }

    // Order by priority (high first) then by created_at
    query = query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: reports, count, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    // Fetch content details for each report
    const reportsWithContent = await Promise.all(
      (reports || []).map(async (report: ReportWithContent) => {
        const content = await fetchReportContent(supabase, report.target_type, report.target_id);
        return { ...report, content };
      })
    );

    return {
      reports: reportsWithContent,
      total: count || 0,
    };
  });
}

/**
 * Helper to fetch content details based on target type
 */
async function fetchReportContent(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  targetType: string,
  targetId: string
): Promise<ReportWithContent['content']> {
  try {
    if (targetType === 'thread') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: thread } = await (supabase as any)
        .from('threads')
        .select(`
          title,
          excerpt,
          author:profiles!author_id(username, avatar_url),
          category:categories!category_id(name)
        `)
        .eq('id', targetId)
        .single();

      if (thread) {
        return {
          title: thread.title,
          excerpt: thread.excerpt || thread.title.slice(0, 100),
          author_username: thread.author?.username,
          author_avatar: thread.author?.avatar_url,
          category_name: thread.category?.name,
        };
      }
    } else if (targetType === 'reply') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: reply } = await (supabase as any)
        .from('replies')
        .select(`
          content,
          author:profiles!author_id(username, avatar_url),
          thread:threads!thread_id(title, category:categories!category_id(name))
        `)
        .eq('id', targetId)
        .single();

      if (reply) {
        return {
          title: `Re: ${reply.thread?.title || 'Unknown Thread'}`,
          excerpt: reply.content?.slice(0, 150) || '',
          author_username: reply.author?.username,
          author_avatar: reply.author?.avatar_url,
          category_name: reply.thread?.category?.name,
        };
      }
    } else if (targetType === 'user') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('username, display_name, avatar_url, bio')
        .eq('id', targetId)
        .single();

      if (profile) {
        return {
          title: `User: ${profile.display_name || profile.username}`,
          excerpt: profile.bio || 'No bio provided',
          author_username: profile.username,
          author_avatar: profile.avatar_url,
        };
      }
    }

    return { title: 'Content not found', excerpt: '' };
  } catch {
    return { title: 'Error loading content', excerpt: '' };
  }
}

/**
 * Update report status (admin only)
 */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  resolutionNotes?: string
): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {
      status,
      moderator_id: adminProfile.id,
    };

    if (resolutionNotes) {
      updateData.resolution_notes = resolutionNotes;
    }

    if (status === 'resolved' || status === 'dismissed') {
      updateData.resolved_at = new Date().toISOString();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('reports')
      .update(updateData)
      .eq('id', reportId);

    if (error) {
      throw new Error(`Failed to update report: ${error.message}`);
    }

    // Log the action
    await logAdminAction('update_report_status', {
      report_id: reportId,
      new_status: status,
      resolution_notes: resolutionNotes,
    }, adminProfile);
  });
}

/**
 * Get report statistics (admin only)
 */
export async function getReportStats(): Promise<AdminActionResult<ReportStats>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();

    // Get all reports for stats calculation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: reports, error } = await (supabase as any)
      .from('reports')
      .select('status, reason, priority, resolved_at');

    if (error) {
      throw new Error(`Failed to fetch report stats: ${error.message}`);
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const stats: ReportStats = {
      totalReports: reports?.length || 0,
      pendingReports: 0,
      highPriorityPending: 0,
      resolvedToday: 0,
      byReason: {},
      byStatus: {},
    };

    for (const report of reports || []) {
      // Count by status
      stats.byStatus[report.status] = (stats.byStatus[report.status] || 0) + 1;

      // Count by reason
      stats.byReason[report.reason] = (stats.byReason[report.reason] || 0) + 1;

      // Pending count
      if (report.status === 'pending') {
        stats.pendingReports++;
        if (report.priority === 'high') {
          stats.highPriorityPending++;
        }
      }

      // Resolved today
      if (report.resolved_at && report.resolved_at >= todayStart) {
        stats.resolvedToday++;
      }
    }

    return stats;
  });
}

/**
 * Get pending reports count (for dashboard)
 */
export async function getPendingReportsCount(): Promise<AdminActionResult<number>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      throw new Error(`Failed to fetch pending reports count: ${error.message}`);
    }

    return count || 0;
  });
}

/**
 * Bulk update report statuses (admin only)
 */
export async function bulkUpdateReportStatus(
  reportIds: string[],
  status: ReportStatus,
  resolutionNotes?: string
): Promise<AdminActionResult<{ updated: number }>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {
      status,
      moderator_id: adminProfile.id,
    };

    if (resolutionNotes) {
      updateData.resolution_notes = resolutionNotes;
    }

    if (status === 'resolved' || status === 'dismissed') {
      updateData.resolved_at = new Date().toISOString();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error, count } = await (supabase as any)
      .from('reports')
      .update(updateData)
      .in('id', reportIds);

    if (error) {
      throw new Error(`Failed to bulk update reports: ${error.message}`);
    }

    // Log the action
    await logAdminAction('bulk_update_report_status', {
      report_ids: reportIds,
      new_status: status,
      count: count || reportIds.length,
    }, adminProfile);

    return { updated: count || reportIds.length };
  });
}
