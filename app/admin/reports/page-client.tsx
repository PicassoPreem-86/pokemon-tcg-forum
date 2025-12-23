'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Filter,
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  FileText,
  User,
  Ban,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getReports, updateReportStatus } from '@/lib/actions/reports';
import type { ReportWithContent, ReportStats, ReportStatus, ReportReason, ReportPriority } from '@/lib/actions/action-types';

interface ReportsPageClientProps {
  initialReports: ReportWithContent[];
  initialTotal: number;
  stats: ReportStats | null;
}

const reasonConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  spam: { label: 'Spam', color: '#F59E0B', icon: AlertTriangle },
  harassment: { label: 'Harassment', color: '#EF4444', icon: Flag },
  offensive: { label: 'Offensive Content', color: '#F97316', icon: AlertTriangle },
  scam: { label: 'Scam/Fraud', color: '#DC2626', icon: Ban },
  illegal: { label: 'Illegal Content', color: '#7C3AED', icon: AlertTriangle },
  other: { label: 'Other', color: '#6B7280', icon: Flag },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: '#F59E0B', icon: Clock },
  reviewing: { label: 'Reviewing', color: '#3B82F6', icon: Eye },
  resolved: { label: 'Resolved', color: '#10B981', icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: '#6B7280', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: 'High', color: '#EF4444' },
  medium: { label: 'Medium', color: '#F59E0B' },
  low: { label: 'Low', color: '#10B981' },
};

export default function ReportsPageClient({
  initialReports,
  initialTotal,
  stats,
}: ReportsPageClientProps) {
  const [reports, setReports] = useState<ReportWithContent[]>(initialReports);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [reasonFilter, setReasonFilter] = useState<ReportReason | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ReportPriority | 'all'>('all');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const totalPages = Math.ceil(total / pageSize);

  // Expanded report
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const fetchReports = useCallback(async (newPage: number = 1) => {
    setLoading(true);
    try {
      const result = await getReports({
        status: statusFilter === 'all' ? undefined : statusFilter,
        reason: reasonFilter === 'all' ? undefined : reasonFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        limit: pageSize,
        offset: (newPage - 1) * pageSize,
      });

      if (result.success && result.data) {
        setReports(result.data.reports);
        setTotal(result.data.total);
        setPage(newPage);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, reasonFilter, priorityFilter]);

  const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus, notes?: string) => {
    setActionLoading(reportId);
    try {
      const result = await updateReportStatus(reportId, newStatus, notes);
      if (result.success) {
        // Update local state
        setReports(prev => prev.map(r =>
          r.id === reportId
            ? { ...r, status: newStatus, resolution_notes: notes || null }
            : r
        ));
      }
    } catch (error) {
      console.error('Error updating report:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = () => {
    fetchReports(1);
  };

  // Filter reports locally by search query
  const filteredReports = reports.filter((report) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.content?.title?.toLowerCase().includes(query) ||
      report.content?.author_username?.toLowerCase().includes(query) ||
      report.reporter?.username?.toLowerCase().includes(query) ||
      report.details?.toLowerCase().includes(query)
    );
  });

  const getContentLink = (report: ReportWithContent): string => {
    if (report.target_type === 'thread') {
      return `/thread/${report.target_id}`;
    } else if (report.target_type === 'reply') {
      return `/thread/${report.target_id}#reply-${report.target_id}`;
    } else if (report.target_type === 'user') {
      return `/u/${report.content?.author_username || report.target_id}`;
    }
    return '#';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-reports">
      {/* Stats Bar */}
      <div className="admin-reports-stats">
        <div className="admin-report-stat">
          <Flag className="w-5 h-5" />
          <span className="stat-value">{stats?.pendingReports || 0}</span>
          <span className="stat-label">Pending Reports</span>
        </div>
        <div className="admin-report-stat urgent">
          <AlertTriangle className="w-5 h-5" />
          <span className="stat-value">{stats?.highPriorityPending || 0}</span>
          <span className="stat-label">High Priority</span>
        </div>
        <div className="admin-report-stat">
          <CheckCircle className="w-5 h-5" />
          <span className="stat-value">{stats?.resolvedToday || 0}</span>
          <span className="stat-label">Resolved Today</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search className="w-5 h-5" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filters">
          <div className="admin-filter">
            <Filter className="w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <div className="admin-filter">
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value as ReportReason | 'all')}
            >
              <option value="all">All Reasons</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="offensive">Offensive</option>
              <option value="scam">Scam/Fraud</option>
              <option value="illegal">Illegal</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="admin-filter">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as ReportPriority | 'all')}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <button onClick={handleSearch} className="admin-btn admin-btn-primary">
            Apply Filters
          </button>

          <button
            onClick={() => fetchReports(page)}
            className="admin-btn admin-btn-secondary"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="admin-reports-list">
        {loading ? (
          <div className="admin-loading">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p>Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="admin-empty-state">
            <CheckCircle className="w-12 h-12" />
            <h3>No reports found</h3>
            <p>There are no reports matching your filters.</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const ReasonIcon = reasonConfig[report.reason]?.icon || Flag;
            const StatusIcon = statusConfig[report.status]?.icon || Clock;
            const isExpanded = expandedReport === report.id;
            const isLoading = actionLoading === report.id;

            return (
              <div
                key={report.id}
                className={`admin-report-item ${report.priority} ${report.status}`}
              >
                <div className="admin-report-main">
                  <div className="admin-report-priority">
                    <span
                      className="priority-indicator"
                      style={{ backgroundColor: priorityConfig[report.priority]?.color }}
                      title={`${priorityConfig[report.priority]?.label} Priority`}
                    />
                  </div>

                  <div className="admin-report-type">
                    {report.target_type === 'thread' && <FileText className="w-5 h-5" />}
                    {report.target_type === 'reply' && <MessageSquare className="w-5 h-5" />}
                    {report.target_type === 'user' && <User className="w-5 h-5" />}
                  </div>

                  <div className="admin-report-content">
                    <div className="admin-report-header">
                      <h3 className="admin-report-title">
                        {report.content?.title || 'Unknown Content'}
                      </h3>
                      <div className="admin-report-badges">
                        <span
                          className="admin-report-reason"
                          style={{
                            backgroundColor: `${reasonConfig[report.reason]?.color}20`,
                            color: reasonConfig[report.reason]?.color,
                          }}
                        >
                          <ReasonIcon className="w-3 h-3" />
                          {reasonConfig[report.reason]?.label}
                        </span>
                        <span
                          className="admin-report-status"
                          style={{
                            backgroundColor: `${statusConfig[report.status]?.color}20`,
                            color: statusConfig[report.status]?.color,
                          }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[report.status]?.label}
                        </span>
                      </div>
                    </div>

                    <p className="admin-report-excerpt">
                      {report.content?.excerpt || 'No content preview available'}
                    </p>

                    <div className="admin-report-meta">
                      <span className="admin-report-author">
                        <Image
                          src={report.content?.author_avatar || '/images/avatars/default.png'}
                          alt={report.content?.author_username || 'User'}
                          width={20}
                          height={20}
                          className="admin-report-avatar"
                        />
                        by <strong>{report.content?.author_username || 'Unknown'}</strong>
                      </span>
                      {report.content?.category_name && (
                        <span className="admin-report-category">
                          in {report.content.category_name}
                        </span>
                      )}
                      <span className="admin-report-time">
                        {formatDate(report.created_at)}
                      </span>
                      <span className="admin-report-reporter">
                        Reported by: <strong>{report.reporter?.username || 'Unknown'}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="admin-report-actions">
                    <button
                      className="admin-expand-btn"
                      onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="admin-report-expanded">
                    <div className="admin-report-details">
                      <h4>Report Details</h4>
                      <p>{report.details || 'No additional details provided.'}</p>
                      {report.resolution_notes && (
                        <div className="admin-report-resolution">
                          <h4>Resolution Notes</h4>
                          <p>{report.resolution_notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="admin-report-action-buttons">
                      <Link
                        href={getContentLink(report)}
                        target="_blank"
                        className="admin-btn primary"
                      >
                        <Eye className="w-4 h-4" /> View Content
                      </Link>

                      {report.status === 'pending' && (
                        <>
                          <button
                            className="admin-btn warning"
                            onClick={() => handleUpdateStatus(report.id, 'reviewing')}
                            disabled={isLoading}
                          >
                            <Eye className="w-4 h-4" /> Mark Reviewing
                          </button>
                        </>
                      )}

                      {(report.status === 'pending' || report.status === 'reviewing') && (
                        <>
                          <button
                            className="admin-btn success"
                            onClick={() => handleUpdateStatus(report.id, 'resolved', 'Action taken on reported content.')}
                            disabled={isLoading}
                          >
                            <CheckCircle className="w-4 h-4" /> Mark Resolved
                          </button>
                          <button
                            className="admin-btn secondary"
                            onClick={() => handleUpdateStatus(report.id, 'dismissed', 'Report dismissed after review.')}
                            disabled={isLoading}
                          >
                            <XCircle className="w-4 h-4" /> Dismiss
                          </button>
                        </>
                      )}

                      {report.target_type !== 'user' && (
                        <button className="admin-btn danger" disabled={isLoading}>
                          <Trash2 className="w-4 h-4" /> Delete Content
                        </button>
                      )}

                      {report.target_type === 'user' || report.content?.author_username ? (
                        <Link
                          href={`/admin/users?search=${report.content?.author_username || ''}`}
                          className="admin-btn danger"
                        >
                          <Ban className="w-4 h-4" /> Manage User
                        </Link>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <div className="admin-pagination-info">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} reports
          </div>
          <div className="admin-pagination-controls">
            <button
              onClick={() => fetchReports(page - 1)}
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
              onClick={() => fetchReports(page + 1)}
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
