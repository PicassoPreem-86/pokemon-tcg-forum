'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
} from 'lucide-react';

// Mock reports data
const mockReports = [
  {
    id: '1',
    type: 'post',
    contentTitle: 'FREE POKEMON CARDS CLICK HERE!!!',
    contentExcerpt: 'Get free Pokemon cards now! Just click this link and enter your credit card...',
    contentAuthor: 'SpamBot123',
    contentAuthorAvatar: '/images/avatars/default.png',
    reportedBy: 'CharizardCollector',
    reportReason: 'spam',
    reportDetails: 'This is clearly a scam/spam post trying to steal credit card info',
    status: 'pending',
    priority: 'high',
    reportedAt: '2024-12-15 10:30',
    category: 'General',
  },
  {
    id: '2',
    type: 'thread',
    contentTitle: 'SCAMMER ALERT - DO NOT TRADE WITH @FakeTrader',
    contentExcerpt: 'Warning everyone about this user who scammed me out of $500...',
    contentAuthor: 'PikachuTrader',
    contentAuthorAvatar: '/images/avatars/default.png',
    reportedBy: 'FakeTrader',
    reportReason: 'harassment',
    reportDetails: 'This post is defamation and harassment against me',
    status: 'pending',
    priority: 'medium',
    reportedAt: '2024-12-15 09:15',
    category: 'General',
  },
  {
    id: '3',
    type: 'post',
    contentTitle: 'Re: Best pulls from Prismatic Evolutions',
    contentExcerpt: 'You guys are all idiots for buying this set...',
    contentAuthor: 'ToxicUser99',
    contentAuthorAvatar: '/images/avatars/default.png',
    reportedBy: 'EeveeEnthusiast',
    reportReason: 'offensive',
    reportDetails: 'Insulting other users in the thread',
    status: 'reviewing',
    priority: 'low',
    reportedAt: '2024-12-14 22:45',
    category: 'Collecting',
  },
  {
    id: '4',
    type: 'user',
    contentTitle: 'User Profile: ScammerAccount',
    contentExcerpt: 'Account created 2 days ago, multiple trade scam reports',
    contentAuthor: 'ScammerAccount',
    contentAuthorAvatar: '/images/avatars/default.png',
    reportedBy: 'Multiple Users',
    reportReason: 'scam',
    reportDetails: 'Multiple users reported being scammed by this account in trades',
    status: 'pending',
    priority: 'high',
    reportedAt: '2024-12-14 18:30',
    category: 'Buy & Trade',
  },
  {
    id: '5',
    type: 'post',
    contentTitle: 'Re: Price check on Base Set Charizard',
    contentExcerpt: 'Check out my website for the best prices: www.fake-pokemon-site.com',
    contentAuthor: 'NewUser2024',
    contentAuthorAvatar: '/images/avatars/default.png',
    reportedBy: 'MewtwoMaster',
    reportReason: 'spam',
    reportDetails: 'Promoting external website/spam link',
    status: 'resolved',
    priority: 'medium',
    reportedAt: '2024-12-14 15:00',
    category: 'Market',
  },
  {
    id: '6',
    type: 'thread',
    contentTitle: 'Selling counterfeit cards - great quality!',
    contentExcerpt: 'I have high quality proxy cards for sale, perfect for tournaments...',
    contentAuthor: 'ProxyKing',
    contentAuthorAvatar: '/images/avatars/default.png',
    reportedBy: 'AuthenticityPro',
    reportReason: 'illegal',
    reportDetails: 'Selling counterfeit cards which is illegal and against TOS',
    status: 'pending',
    priority: 'high',
    reportedAt: '2024-12-14 12:00',
    category: 'Buy & Trade',
  },
];

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

export default function AdminReports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.contentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.contentAuthor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesReason = reasonFilter === 'all' || report.reportReason === reasonFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesReason && matchesPriority;
  });

  const pendingCount = mockReports.filter((r) => r.status === 'pending').length;
  const highPriorityCount = mockReports.filter((r) => r.priority === 'high' && r.status === 'pending').length;

  return (
    <div className="admin-reports">
      {/* Stats Bar */}
      <div className="admin-reports-stats">
        <div className="admin-report-stat">
          <Flag className="w-5 h-5" />
          <span className="stat-value">{pendingCount}</span>
          <span className="stat-label">Pending Reports</span>
        </div>
        <div className="admin-report-stat urgent">
          <AlertTriangle className="w-5 h-5" />
          <span className="stat-value">{highPriorityCount}</span>
          <span className="stat-label">High Priority</span>
        </div>
        <div className="admin-report-stat">
          <CheckCircle className="w-5 h-5" />
          <span className="stat-value">{mockReports.filter((r) => r.status === 'resolved').length}</span>
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
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <div className="admin-filter">
            <select value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)}>
              <option value="all">All Reasons</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="offensive">Offensive</option>
              <option value="scam">Scam/Fraud</option>
              <option value="illegal">Illegal</option>
            </select>
          </div>
          <div className="admin-filter">
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="admin-reports-list">
        {filteredReports.map((report) => {
          const ReasonIcon = reasonConfig[report.reportReason]?.icon || Flag;
          const StatusIcon = statusConfig[report.status]?.icon || Clock;
          const isExpanded = expandedReport === report.id;

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
                  {report.type === 'thread' && <FileText className="w-5 h-5" />}
                  {report.type === 'post' && <MessageSquare className="w-5 h-5" />}
                  {report.type === 'user' && <User className="w-5 h-5" />}
                </div>

                <div className="admin-report-content">
                  <div className="admin-report-header">
                    <h3 className="admin-report-title">{report.contentTitle}</h3>
                    <div className="admin-report-badges">
                      <span
                        className="admin-report-reason"
                        style={{
                          backgroundColor: `${reasonConfig[report.reportReason]?.color}20`,
                          color: reasonConfig[report.reportReason]?.color,
                        }}
                      >
                        <ReasonIcon className="w-3 h-3" />
                        {reasonConfig[report.reportReason]?.label}
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

                  <p className="admin-report-excerpt">{report.contentExcerpt}</p>

                  <div className="admin-report-meta">
                    <span className="admin-report-author">
                      <Image
                        src={report.contentAuthorAvatar}
                        alt={report.contentAuthor}
                        width={20}
                        height={20}
                        className="admin-report-avatar"
                      />
                      by <strong>{report.contentAuthor}</strong>
                    </span>
                    <span className="admin-report-category">in {report.category}</span>
                    <span className="admin-report-time">{report.reportedAt}</span>
                    <span className="admin-report-reporter">
                      Reported by: <strong>{report.reportedBy}</strong>
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
                    <p>{report.reportDetails}</p>
                  </div>

                  <div className="admin-report-action-buttons">
                    <button className="admin-btn primary">
                      <Eye className="w-4 h-4" /> View Content
                    </button>
                    <button className="admin-btn success">
                      <CheckCircle className="w-4 h-4" /> Mark Resolved
                    </button>
                    <button className="admin-btn secondary">
                      <XCircle className="w-4 h-4" /> Dismiss
                    </button>
                    <button className="admin-btn warning">
                      <AlertTriangle className="w-4 h-4" /> Warn User
                    </button>
                    <button className="admin-btn danger">
                      <Trash2 className="w-4 h-4" /> Delete Content
                    </button>
                    <button className="admin-btn danger">
                      <Ban className="w-4 h-4" /> Ban User
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="admin-empty-state">
          <CheckCircle className="w-12 h-12" />
          <h3>No reports found</h3>
          <p>There are no reports matching your filters.</p>
        </div>
      )}
    </div>
  );
}
