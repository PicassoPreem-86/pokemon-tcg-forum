'use server';

import { createClient } from '@/lib/supabase/server';
import { withAdminAuth, type AdminActionResult } from '@/lib/auth/admin-check';
import type {
  AdminAuditLog,
  GetAuditLogsFilters,
  AuditLogStats,
} from './action-types';

// Re-export types for consumers
export type { AdminAuditLog, GetAuditLogsFilters, AuditLogStats } from './action-types';

/**
 * Get admin audit logs with filtering and pagination
 * Requires admin authentication
 *
 * @param filters - Optional filters for the query
 * @returns Promise<AdminActionResult<{ logs: AdminAuditLog[]; total: number }>>
 */
export async function getAuditLogs(
  filters: GetAuditLogsFilters = {}
): Promise<AdminActionResult<{ logs: AdminAuditLog[]; total: number }>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();
    const {
      adminId,
      action,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('admin_audit_log')
      .select('*, admin:profiles!admin_id(username, display_name, avatar_url)', { count: 'exact' });

    // Apply filters
    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: logs, count, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return {
      logs: logs || [],
      total: count || 0,
    };
  });
}

/**
 * Get recent admin audit activity for dashboard
 *
 * @param limit - Maximum number of logs to return
 * @returns Promise<AdminActionResult<AdminAuditLog[]>>
 */
export async function getRecentAuditActivity(
  limit = 10
): Promise<AdminActionResult<AdminAuditLog[]>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: logs, error } = await (supabase as any)
      .from('admin_audit_log')
      .select('*, admin:profiles!admin_id(username, display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent audit activity: ${error.message}`);
    }

    return logs || [];
  });
}

/**
 * Get audit log statistics
 *
 * @returns Promise<AdminActionResult<AuditLogStats>>
 */
export async function getAuditLogStats(): Promise<AdminActionResult<AuditLogStats>> {
  return withAdminAuth(async () => {
    const supabase = await createClient();

    // Get total count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: totalActions } = await (supabase as any)
      .from('admin_audit_log')
      .select('*', { count: 'exact', head: true });

    // Get action counts by type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: actionCounts } = await (supabase as any)
      .from('admin_audit_log')
      .select('action');

    const actionsByType: Record<string, number> = {};
    if (actionCounts) {
      for (const item of actionCounts) {
        actionsByType[item.action] = (actionsByType[item.action] || 0) + 1;
      }
    }

    // Get recent activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recentActivity } = await (supabase as any)
      .from('admin_audit_log')
      .select('*, admin:profiles!admin_id(username, display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      totalActions: totalActions || 0,
      actionsByType,
      recentActivity: recentActivity || [],
    };
  });
}

/**
 * Get audit logs for a specific admin
 *
 * @param adminId - The ID of the admin
 * @param limit - Maximum number of logs to return
 * @returns Promise<AdminActionResult<AdminAuditLog[]>>
 */
export async function getAdminAuditHistory(
  adminId: string,
  limit = 20
): Promise<AdminActionResult<AdminAuditLog[]>> {
  const result = await getAuditLogs({
    adminId,
    limit,
  });

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: result.data?.logs || [],
  };
}

/**
 * Search audit logs by action type
 *
 * @param action - The action type to search for
 * @param limit - Maximum number of logs to return
 * @returns Promise<AdminActionResult<AdminAuditLog[]>>
 */
export async function searchAuditLogsByAction(
  action: string,
  limit = 50
): Promise<AdminActionResult<AdminAuditLog[]>> {
  const result = await getAuditLogs({
    action,
    limit,
  });

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: result.data?.logs || [],
  };
}
