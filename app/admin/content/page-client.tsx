'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Lock,
  Unlock,
  Pin,
  PinOff,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import {
  getAdminContent,
  toggleThreadPin,
  toggleThreadLock,
  deleteThread,
  deleteReply,
  restoreThread,
  restoreReply,
  bulkDeleteContent,
  bulkLockThreads,
} from '@/lib/actions/content';
import type { AdminContentItem, ContentStats, ContentType } from '@/lib/actions/action-types';

interface ContentPageClientProps {
  initialContent: AdminContentItem[];
  initialTotal: number;
  stats: ContentStats | null;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  active: { color: '#10B981', icon: CheckCircle, label: 'Active' },
  flagged: { color: '#F59E0B', icon: AlertTriangle, label: 'Flagged' },
  deleted: { color: '#EF4444', icon: Trash2, label: 'Deleted' },
  locked: { color: '#6B7280', icon: Lock, label: 'Locked' },
};

export default function ContentPageClient({
  initialContent,
  initialTotal,
  stats,
}: ContentPageClientProps) {
  const [content, setContent] = useState<AdminContentItem[]>(initialContent);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'flagged' | 'deleted'>('all');

  // Selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const totalPages = Math.ceil(total / pageSize);

  const fetchContent = useCallback(async (newPage: number = 1) => {
    setLoading(true);
    try {
      const result = await getAdminContent({
        type: typeFilter === 'all' ? undefined : typeFilter,
        status: statusFilter,
        search: searchQuery || undefined,
        limit: pageSize,
        offset: (newPage - 1) * pageSize,
      });

      if (result.success && result.data) {
        setContent(result.data.content);
        setTotal(result.data.total);
        setPage(newPage);
        setSelectedItems(new Set());
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, searchQuery]);

  const handleSearch = () => {
    fetchContent(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === content.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(content.map(c => c.id)));
    }
  };

  const getItemStatus = (item: AdminContentItem): string => {
    if (item.deleted_at) return 'deleted';
    if (item.report_count > 0) return 'flagged';
    if (item.is_locked) return 'locked';
    return 'active';
  };

  const handlePin = async (item: AdminContentItem) => {
    if (item.type !== 'thread') return;
    setActionLoading(item.id);
    try {
      const result = await toggleThreadPin(item.id, !item.is_pinned);
      if (result.success) {
        setContent(prev => prev.map(c =>
          c.id === item.id ? { ...c, is_pinned: !c.is_pinned } : c
        ));
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLock = async (item: AdminContentItem) => {
    if (item.type !== 'thread') return;
    setActionLoading(item.id);
    try {
      const result = await toggleThreadLock(item.id, !item.is_locked);
      if (result.success) {
        setContent(prev => prev.map(c =>
          c.id === item.id ? { ...c, is_locked: !c.is_locked } : c
        ));
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (item: AdminContentItem) => {
    if (!confirm(`Are you sure you want to delete this ${item.type}?`)) return;
    setActionLoading(item.id);
    try {
      const result = item.type === 'thread'
        ? await deleteThread(item.id)
        : await deleteReply(item.id);
      if (result.success) {
        setContent(prev => prev.map(c =>
          c.id === item.id ? { ...c, deleted_at: new Date().toISOString() } : c
        ));
      }
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (item: AdminContentItem) => {
    setActionLoading(item.id);
    try {
      const result = item.type === 'thread'
        ? await restoreThread(item.id)
        : await restoreReply(item.id);
      if (result.success) {
        setContent(prev => prev.map(c =>
          c.id === item.id ? { ...c, deleted_at: null } : c
        ));
      }
    } catch (error) {
      console.error('Error restoring:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Delete ${selectedItems.size} selected items?`)) return;

    setLoading(true);
    try {
      const items = content
        .filter(c => selectedItems.has(c.id))
        .map(c => ({ id: c.id, type: c.type }));
      const result = await bulkDeleteContent(items);
      if (result.success) {
        await fetchContent(page);
      }
    } catch (error) {
      console.error('Error bulk deleting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkLock = async () => {
    const threadIds = content
      .filter(c => selectedItems.has(c.id) && c.type === 'thread' && !c.is_locked)
      .map(c => c.id);

    if (threadIds.length === 0) {
      alert('No unlocked threads selected');
      return;
    }

    setLoading(true);
    try {
      const result = await bulkLockThreads(threadIds, true);
      if (result.success) {
        await fetchContent(page);
      }
    } catch (error) {
      console.error('Error bulk locking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentLink = (item: AdminContentItem): string => {
    if (item.type === 'thread') {
      return `/thread/${item.id}`;
    } else if (item.thread_slug) {
      return `/thread/${item.thread_slug}#reply-${item.id}`;
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
    <div className="admin-content-page">
      {/* Stats Bar */}
      {stats && (
        <div className="admin-content-stats">
          <div className="admin-content-stat">
            <FileText className="w-5 h-5" />
            <span className="stat-value">{stats.totalThreads}</span>
            <span className="stat-label">Threads</span>
          </div>
          <div className="admin-content-stat">
            <MessageSquare className="w-5 h-5" />
            <span className="stat-value">{stats.totalReplies}</span>
            <span className="stat-label">Replies</span>
          </div>
          <div className="admin-content-stat flagged">
            <AlertTriangle className="w-5 h-5" />
            <span className="stat-value">{stats.flaggedContent}</span>
            <span className="stat-label">Flagged</span>
          </div>
          <div className="admin-content-stat">
            <Trash2 className="w-5 h-5" />
            <span className="stat-value">{stats.deletedToday}</span>
            <span className="stat-label">Deleted Today</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search className="w-5 h-5" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="admin-filters">
          <div className="admin-filter">
            <Filter className="w-4 h-4" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ContentType | 'all')}
            >
              <option value="all">All Types</option>
              <option value="thread">Threads</option>
              <option value="reply">Replies</option>
            </select>
          </div>
          <div className="admin-filter">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'flagged' | 'deleted')}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <button onClick={handleSearch} className="admin-btn admin-btn-primary">
            Apply Filters
          </button>

          <button
            onClick={() => fetchContent(page)}
            className="admin-btn admin-btn-secondary"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="admin-bulk-actions">
          <span>{selectedItems.size} selected</span>
          <button className="admin-bulk-btn warning" onClick={handleBulkLock}>
            <Lock className="w-4 h-4" /> Lock
          </button>
          <button className="admin-bulk-btn danger" onClick={handleBulkDelete}>
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button className="admin-bulk-btn" onClick={() => setSelectedItems(new Set())}>
            Clear Selection
          </button>
        </div>
      )}

      {/* Content List */}
      <div className="admin-content-list">
        {loading ? (
          <div className="admin-loading">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p>Loading content...</p>
          </div>
        ) : content.length === 0 ? (
          <div className="admin-empty-state">
            <FileText className="w-12 h-12" />
            <h3>No content found</h3>
            <p>Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="admin-content-select-all">
              <input
                type="checkbox"
                checked={selectedItems.size === content.length && content.length > 0}
                onChange={toggleSelectAll}
              />
              <span>Select All</span>
            </div>

            {content.map((item) => {
              const itemStatus = getItemStatus(item);
              const StatusIcon = statusConfig[itemStatus]?.icon || CheckCircle;
              const isLoading = actionLoading === item.id;

              return (
                <div
                  key={item.id}
                  className={`admin-content-item ${itemStatus === 'deleted' ? 'deleted' : ''} ${itemStatus === 'flagged' ? 'flagged' : ''}`}
                >
                  <div className="admin-content-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelection(item.id)}
                    />
                  </div>

                  <div className="admin-content-icon">
                    {item.type === 'thread' ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <MessageSquare className="w-5 h-5" />
                    )}
                  </div>

                  <div className="admin-content-info">
                    <div className="admin-content-header">
                      <h3 className="admin-content-title">
                        {item.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                        {item.is_locked && <Lock className="w-4 h-4 text-red-500" />}
                        {item.title}
                      </h3>
                      <span
                        className="admin-content-status"
                        style={{
                          backgroundColor: `${statusConfig[itemStatus]?.color}20`,
                          color: statusConfig[itemStatus]?.color,
                        }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[itemStatus]?.label}
                      </span>
                    </div>

                    <div className="admin-content-meta">
                      <span className="admin-content-author">
                        <Image
                          src={item.author_avatar || '/images/avatars/default.png'}
                          alt={item.author_username}
                          width={20}
                          height={20}
                          className="admin-content-avatar"
                        />
                        by <strong>{item.author_username}</strong>
                      </span>
                      {item.category_name && (
                        <span>in <strong>{item.category_name}</strong></span>
                      )}
                      <span>
                        <Clock className="w-3 h-3" />
                        {formatDate(item.created_at)}
                      </span>
                      {item.report_count > 0 && (
                        <span className="admin-content-reports">
                          <AlertTriangle className="w-3 h-3" /> {item.report_count} reports
                        </span>
                      )}
                    </div>

                    <div className="admin-content-stats">
                      {item.type === 'thread' && (
                        <>
                          <span><MessageSquare className="w-4 h-4" /> {item.reply_count}</span>
                          <span><Eye className="w-4 h-4" /> {item.view_count}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="admin-content-actions">
                    <Link
                      href={getContentLink(item)}
                      target="_blank"
                      className="admin-action-icon"
                      title="View"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {item.type === 'thread' && !item.deleted_at && (
                      <>
                        <button
                          className="admin-action-icon"
                          title={item.is_pinned ? 'Unpin' : 'Pin'}
                          onClick={() => handlePin(item)}
                          disabled={isLoading}
                        >
                          {item.is_pinned ? (
                            <PinOff className="w-4 h-4" />
                          ) : (
                            <Pin className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          className={`admin-action-icon ${item.is_locked ? 'success' : 'warning'}`}
                          title={item.is_locked ? 'Unlock' : 'Lock'}
                          onClick={() => handleLock(item)}
                          disabled={isLoading}
                        >
                          {item.is_locked ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}

                    {item.deleted_at ? (
                      <button
                        className="admin-action-icon success"
                        title="Restore"
                        onClick={() => handleRestore(item)}
                        disabled={isLoading}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        className="admin-action-icon danger"
                        title="Delete"
                        onClick={() => handleDelete(item)}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <div className="admin-pagination-info">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} items
          </div>
          <div className="admin-pagination-controls">
            <button
              onClick={() => fetchContent(page - 1)}
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
              onClick={() => fetchContent(page + 1)}
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
