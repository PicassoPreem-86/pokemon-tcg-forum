'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import type { Profile, ModerationLog } from '@/lib/supabase/database.types';
// Import types from separate file (Next.js 15/16 'use server' files can only export async functions)
import type {
  ModerationAction,
  ModerationTargetType,
  GetModerationLogsFilters,
  ModerationStats,
} from './action-types';

// Re-export types for consumers
export type {
  ModerationAction,
  ModerationTargetType,
  GetModerationLogsFilters,
  ModerationStats,
} from './action-types';

/**
 * Log a moderation action to the database
 * Creates an audit trail for all moderation activities
 *
 * @param action - The type of moderation action performed
 * @param targetId - The ID of the target (user, thread, or reply)
 * @param targetType - The type of target
 * @param reason - The reason for the moderation action
 * @param moderatorProfile - The profile of the moderator performing the action
 * @param additionalDetails - Any additional context or metadata
 * @returns Promise<void>
 */
export async function logModerationAction(
  action: ModerationAction,
  targetId: string,
  targetType: ModerationTargetType,
  reason: string | null,
  moderatorProfile: Profile,
  additionalDetails?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();
    const headersList = await headers();

    // Extract request metadata
    const ipAddress = headersList.get('x-forwarded-for') ||
                     headersList.get('x-real-ip') ||
                     null;
    const userAgent = headersList.get('user-agent') || null;

    // Prepare log entry
    const logEntry = {
      moderator_id: moderatorProfile.id,
      action,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: additionalDetails ? JSON.parse(JSON.stringify(additionalDetails)) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    };

    // Insert into moderation_logs table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('moderation_logs')
      .insert(logEntry);

    if (error) {
      console.error('[MODERATION LOG ERROR]', {
        error: error.message,
        action,
        targetId,
        moderator: moderatorProfile.username,
      });
      throw new Error(`Failed to log moderation action: ${error.message}`);
    }

    // Also log to console for immediate visibility
    console.log('[MODERATION ACTION]', {
      timestamp: new Date().toISOString(),
      moderator_id: moderatorProfile.id,
      moderator_username: moderatorProfile.username,
      action,
      target_type: targetType,
      target_id: targetId,
      reason,
      ip_address: ipAddress,
      details: additionalDetails,
    });
  } catch (error) {
    console.error('[MODERATION LOG CRITICAL ERROR]', error);
    // Don't throw - we don't want logging failures to break moderation actions
    // But we do log the error for monitoring
  }
}

/**
 * Get moderation logs with filtering and pagination
 *
 * @param filters - Optional filters for the query
 * @returns Promise<ModerationLog[]>
 */
export async function getModerationLogs(
  filters: GetModerationLogsFilters = {}
): Promise<{ logs: ModerationLog[]; total: number }> {
  try {
    const supabase = await createClient();
    const {
      moderatorId,
      targetType,
      targetId,
      action,
      limit = 50,
      offset = 0
    } = filters;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('moderation_logs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (moderatorId) {
      query = query.eq('moderator_id', moderatorId);
    }

    if (targetType) {
      query = query.eq('target_type', targetType);
    }

    if (targetId) {
      query = query.eq('target_id', targetId);
    }

    if (action) {
      query = query.eq('action', action);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: logs, count, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch moderation logs: ${error.message}`);
    }

    return {
      logs: logs || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching moderation logs:', error);
    throw error;
  }
}

/**
 * Get moderation logs for a specific target
 *
 * @param targetId - The ID of the target
 * @param targetType - The type of target
 * @param limit - Maximum number of logs to return
 * @returns Promise<ModerationLog[]>
 */
export async function getTargetModerationHistory(
  targetId: string,
  targetType: ModerationTargetType,
  limit = 20
): Promise<ModerationLog[]> {
  const { logs } = await getModerationLogs({
    targetId,
    targetType,
    limit,
  });
  return logs;
}

/**
 * Get recent moderation activity for dashboard
 *
 * @param limit - Maximum number of logs to return
 * @returns Promise<ModerationLog[]>
 */
export async function getRecentModerationActivity(
  limit = 10
): Promise<ModerationLog[]> {
  const { logs } = await getModerationLogs({ limit });
  return logs;
}

/**
 * Get moderation statistics for a moderator
 *
 * @param moderatorId - The ID of the moderator
 * @returns Promise<ModerationStats>
 */
export async function getModeratorStats(
  moderatorId: string
): Promise<ModerationStats> {
  try {
    const supabase = await createClient();

    // Get total actions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: totalActions } = await (supabase as any)
      .from('moderation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('moderator_id', moderatorId);

    // Get action counts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: bans } = await (supabase as any)
      .from('moderation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('moderator_id', moderatorId)
      .in('action', ['ban_user']);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: suspensions } = await (supabase as any)
      .from('moderation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('moderator_id', moderatorId)
      .in('action', ['suspend_user']);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: deletions } = await (supabase as any)
      .from('moderation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('moderator_id', moderatorId)
      .in('action', ['delete_thread', 'delete_reply']);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: locks } = await (supabase as any)
      .from('moderation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('moderator_id', moderatorId)
      .in('action', ['lock_thread']);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: pins } = await (supabase as any)
      .from('moderation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('moderator_id', moderatorId)
      .in('action', ['pin_thread']);

    // Get recent activity
    const recentActivity = await getRecentModerationActivity(5);

    return {
      totalActions: totalActions || 0,
      bans: bans || 0,
      suspensions: suspensions || 0,
      deletions: deletions || 0,
      locks: locks || 0,
      pins: pins || 0,
      recentActivity,
    };
  } catch (error) {
    console.error('Error fetching moderator stats:', error);
    throw error;
  }
}
