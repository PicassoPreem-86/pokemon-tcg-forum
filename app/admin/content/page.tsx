'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

// Mock content data
const mockContent = [
  {
    id: '1',
    type: 'thread',
    title: 'WTS PSA 10 Base Set Charizard',
    author: 'CharizardCollector',
    category: 'Market',
    status: 'active',
    isPinned: true,
    isLocked: false,
    createdAt: '2024-12-15 14:30',
    reports: 0,
    replies: 45,
    views: 1247,
  },
  {
    id: '2',
    type: 'thread',
    title: 'SCAMMER ALERT - DO NOT TRADE WITH @FakeTrader',
    author: 'PikachuTrader',
    category: 'General',
    status: 'flagged',
    isPinned: false,
    isLocked: false,
    createdAt: '2024-12-15 12:15',
    reports: 3,
    replies: 28,
    views: 892,
  },
  {
    id: '3',
    type: 'post',
    title: 'Re: Best deck for current meta?',
    author: 'MewtwoMaster',
    category: 'Grading',
    status: 'active',
    isPinned: false,
    isLocked: false,
    createdAt: '2024-12-15 11:00',
    reports: 0,
    replies: 0,
    views: 156,
  },
  {
    id: '4',
    type: 'thread',
    title: 'FREE POKEMON CARDS CLICK HERE!!!',
    author: 'SpamBot123',
    category: 'General',
    status: 'spam',
    isPinned: false,
    isLocked: true,
    createdAt: '2024-12-15 10:30',
    reports: 12,
    replies: 2,
    views: 89,
  },
  {
    id: '5',
    type: 'thread',
    title: 'My PSA 10 Collection Showcase',
    author: 'EeveeEnthusiast',
    category: 'Collecting',
    status: 'active',
    isPinned: false,
    isLocked: false,
    createdAt: '2024-12-14 20:00',
    reports: 0,
    replies: 67,
    views: 2341,
  },
  {
    id: '6',
    type: 'post',
    title: 'Re: Price check on 1st edition Blastoise',
    author: 'NewTrainer2024',
    category: 'Market',
    status: 'pending',
    isPinned: false,
    isLocked: false,
    createdAt: '2024-12-14 18:45',
    reports: 1,
    replies: 0,
    views: 34,
  },
];

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  active: { color: '#10B981', icon: CheckCircle },
  flagged: { color: '#F59E0B', icon: AlertTriangle },
  spam: { color: '#EF4444', icon: AlertTriangle },
  pending: { color: '#6B7280', icon: Clock },
};

export default function AdminContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContent, setSelectedContent] = useState<string[]>([]);

  const filteredContent = mockContent.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleSelection = (id: string) => {
    setSelectedContent((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="admin-content-page">
      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search className="w-5 h-5" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filters">
          <div className="admin-filter">
            <Filter className="w-4 h-4" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="thread">Threads</option>
              <option value="post">Posts</option>
            </select>
          </div>
          <div className="admin-filter">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="spam">Spam</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {selectedContent.length > 0 && (
          <div className="admin-bulk-actions">
            <span>{selectedContent.length} selected</span>
            <button className="admin-bulk-btn">
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button className="admin-bulk-btn warning">
              <Lock className="w-4 h-4" /> Lock
            </button>
            <button className="admin-bulk-btn danger">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Content List */}
      <div className="admin-content-list">
        {filteredContent.map((item) => {
          const StatusIcon = statusConfig[item.status]?.icon || CheckCircle;
          return (
            <div
              key={item.id}
              className={`admin-content-item ${item.status === 'spam' ? 'spam' : ''} ${item.status === 'flagged' ? 'flagged' : ''}`}
            >
              <div className="admin-content-checkbox">
                <input
                  type="checkbox"
                  checked={selectedContent.includes(item.id)}
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
                    {item.isPinned && <Pin className="w-4 h-4 text-yellow-500" />}
                    {item.isLocked && <Lock className="w-4 h-4 text-red-500" />}
                    {item.title}
                  </h3>
                  <span
                    className="admin-content-status"
                    style={{ backgroundColor: `${statusConfig[item.status]?.color}20`, color: statusConfig[item.status]?.color }}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {item.status}
                  </span>
                </div>

                <div className="admin-content-meta">
                  <span>by <strong>{item.author}</strong></span>
                  <span>in <strong>{item.category}</strong></span>
                  <span>{item.createdAt}</span>
                  {item.reports > 0 && (
                    <span className="admin-content-reports">
                      <AlertTriangle className="w-3 h-3" /> {item.reports} reports
                    </span>
                  )}
                </div>

                <div className="admin-content-stats">
                  <span><MessageSquare className="w-4 h-4" /> {item.replies}</span>
                  <span><Eye className="w-4 h-4" /> {item.views}</span>
                </div>
              </div>

              <div className="admin-content-actions">
                <button className="admin-action-icon" title="View">
                  <Eye className="w-4 h-4" />
                </button>
                {item.isPinned ? (
                  <button className="admin-action-icon" title="Unpin">
                    <PinOff className="w-4 h-4" />
                  </button>
                ) : (
                  <button className="admin-action-icon" title="Pin">
                    <Pin className="w-4 h-4" />
                  </button>
                )}
                {item.isLocked ? (
                  <button className="admin-action-icon success" title="Unlock">
                    <Unlock className="w-4 h-4" />
                  </button>
                ) : (
                  <button className="admin-action-icon warning" title="Lock">
                    <Lock className="w-4 h-4" />
                  </button>
                )}
                <button className="admin-action-icon danger" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="admin-pagination">
        <span>Showing {filteredContent.length} of {mockContent.length} items</span>
        <div className="admin-pagination-buttons">
          <button disabled>Previous</button>
          <button className="active">1</button>
          <button>2</button>
          <button>Next</button>
        </div>
      </div>
    </div>
  );
}
