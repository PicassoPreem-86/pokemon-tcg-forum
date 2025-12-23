'use client';

import React, { useState, useCallback } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Activity,
  Clock,
  Globe,
  Monitor,
} from 'lucide-react';
import { getAuditLogs } from '@/lib/actions/audit-log';
import type { AdminAuditLog, AuditLogStats } from '@/lib/actions/action-types';

interface AuditLogPageClientProps {
  initialLogs: AdminAuditLog[];
  initialTotal: number;
  stats: AuditLogStats | null;
}

// Action type labels for display
const ACTION_LABELS: Record<string, string> = {
  'update_user_role': 'Role Update',
  'bulk_update_roles': 'Bulk Role Update',
  'ban_user': 'Ban User',
  'unban_user': 'Unban User',
  'suspend_user': 'Suspend User',
  'unsuspend_user': 'Unsuspend User',
  'delete_thread': 'Delete Thread',
  'delete_reply': 'Delete Reply',
  'lock_thread': 'Lock Thread',
  'unlock_thread': 'Unlock Thread',
  'pin_thread': 'Pin Thread',
  'unpin_thread': 'Unpin Thread',
  'update_settings': 'Update Settings',
  'create_category': 'Create Category',
  'update_category': 'Update Category',
  'delete_category': 'Delete Category',
};

// Action type colors for badges
const ACTION_COLORS: Record<string, string> = {
  'update_user_role': 'bg-blue-500/20 text-blue-400',
  'bulk_update_roles': 'bg-purple-500/20 text-purple-400',
  'ban_user': 'bg-red-500/20 text-red-400',
  'unban_user': 'bg-green-500/20 text-green-400',
  'suspend_user': 'bg-orange-500/20 text-orange-400',
  'unsuspend_user': 'bg-green-500/20 text-green-400',
  'delete_thread': 'bg-red-500/20 text-red-400',
  'delete_reply': 'bg-red-500/20 text-red-400',
  'lock_thread': 'bg-yellow-500/20 text-yellow-400',
  'unlock_thread': 'bg-green-500/20 text-green-400',
  'pin_thread': 'bg-blue-500/20 text-blue-400',
  'unpin_thread': 'bg-gray-500/20 text-gray-400',
  'update_settings': 'bg-purple-500/20 text-purple-400',
  'create_category': 'bg-green-500/20 text-green-400',
  'update_category': 'bg-blue-500/20 text-blue-400',
  'delete_category': 'bg-red-500/20 text-red-400',
};

export default function AuditLogPageClient({
  initialLogs,
  initialTotal,
  stats,
}: AuditLogPageClientProps) {
  const [logs, setLogs] = useState<AdminAuditLog[]>(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const totalPages = Math.ceil(total / pageSize);

  // Expanded row for details
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = useCallback(async (newPage: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAuditLogs({
        action: actionFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: pageSize,
        offset: (newPage - 1) * pageSize,
      });

      if (result.success && result.data) {
        setLogs(result.data.logs);
        setTotal(result.data.total);
        setPage(newPage);
      } else {
        setError(result.error || 'Failed to fetch audit logs');
      }
    } catch (err) {
      setError('An error occurred while fetching audit logs');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, startDate, endDate]);

  const handleSearch = () => {
    fetchLogs(1);
  };

  const handleClearFilters = () => {
    setActionFilter('');
    setStartDate('');
    setEndDate('');
    fetchLogs(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const getActionLabel = (action: string) => {
    return ACTION_LABELS[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || 'bg-gray-500/20 text-gray-400';
  };

  // Get unique actions from stats for filter dropdown
  const uniqueActions = stats?.actionsByType ? Object.keys(stats.actionsByType) : [];

  return (
    <div className="admin-page">
      {/* Stats Cards */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div className="admin-stat-content">
              <span className="admin-stat-value">{stats.totalActions}</span>
              <span className="admin-stat-label">Total Actions</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <div className="admin-stat-content">
              <span className="admin-stat-value">{Object.keys(stats.actionsByType).length}</span>
              <span className="admin-stat-label">Action Types</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <User className="w-6 h-6 text-purple-400" />
            </div>
            <div className="admin-stat-content">
              <span className="admin-stat-value">
                {stats.recentActivity.length > 0
                  ? stats.recentActivity[0].admin?.username || 'Unknown'
                  : 'N/A'}
              </span>
              <span className="admin-stat-label">Last Active Admin</span>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-filters">
          {/* Action Filter */}
          <div className="admin-filter-group">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="admin-select"
            >
              <option value="">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="admin-filter-group">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="admin-date-input"
              placeholder="Start Date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="admin-date-input"
              placeholder="End Date"
            />
          </div>

          <button
            onClick={handleSearch}
            className="admin-btn admin-btn-primary"
            disabled={loading}
          >
            <Search className="w-4 h-4" />
            Search
          </button>

          <button
            onClick={handleClearFilters}
            className="admin-btn admin-btn-secondary"
            disabled={loading}
          >
            Clear
          </button>
        </div>

        <button
          onClick={() => fetchLogs(page)}
          className="admin-btn admin-btn-secondary"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-400">Loading audit logs...</p>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr
                    className={`cursor-pointer hover:bg-white/5 ${expandedLogId === log.id ? 'bg-white/5' : ''}`}
                    onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                  >
                    <td>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{formatRelativeTime(log.created_at)}</span>
                        <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {log.admin?.display_name || log.admin?.username || 'Unknown'}
                          </span>
                          {log.admin?.username && log.admin?.display_name && (
                            <span className="text-xs text-gray-500">@{log.admin.username}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-gray-400 truncate max-w-[200px] block">
                        {log.details
                          ? Object.entries(log.details).slice(0, 2).map(([key, val]) =>
                              `${key}: ${typeof val === 'object' ? JSON.stringify(val) : val}`
                            ).join(', ')
                          : 'No details'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Globe className="w-3 h-3" />
                        <span>{log.ip_address || 'Unknown'}</span>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Details Row */}
                  {expandedLogId === log.id && (
                    <tr className="bg-white/5">
                      <td colSpan={5} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Full Details</h4>
                            <pre className="text-xs bg-black/30 p-3 rounded-lg overflow-auto max-h-[200px] text-gray-400">
                              {log.details ? JSON.stringify(log.details, null, 2) : 'No details available'}
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Request Info</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-400">
                                <Globe className="w-4 h-4" />
                                <span>IP: {log.ip_address || 'Not recorded'}</span>
                              </div>
                              <div className="flex items-start gap-2 text-gray-400">
                                <Monitor className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span className="break-all">
                                  {log.user_agent || 'User agent not recorded'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <div className="admin-pagination-info">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} entries
          </div>
          <div className="admin-pagination-controls">
            <button
              onClick={() => fetchLogs(page - 1)}
              disabled={page <= 1 || loading}
              className="admin-pagination-btn"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="admin-pagination-current">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchLogs(page + 1)}
              disabled={page >= totalPages || loading}
              className="admin-pagination-btn"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
