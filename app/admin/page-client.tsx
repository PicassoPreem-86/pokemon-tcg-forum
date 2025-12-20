'use client';

import React from 'react';
import {
  Users,
  MessageSquare,
  TrendingUp,
  Eye,
  UserPlus,
  FileText,
  Flag,
  AlertTriangle,
} from 'lucide-react';
import type { TopContributor } from '@/lib/actions/admin';

// Icon mapping for serializable props from server component
const STAT_ICONS: Record<string, React.ElementType> = {
  'Total Users': Users,
  'Total Posts': MessageSquare,
  'Active Today': TrendingUp,
  'Total Threads': Eye,
};

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  user: UserPlus,
  thread: FileText,
  post: FileText,
  report: Flag,
};

interface DashboardStat {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  color: string;
}

interface ActivityItem {
  type: string;
  message: string;
  time: string;
}

interface PendingItem {
  type: string;
  count: number;
  color: string;
}

interface AdminDashboardClientProps {
  dashboardStats: DashboardStat[];
  recentActivity: ActivityItem[];
  pendingItems: PendingItem[];
  topUsers: TopContributor[];
  isLoading: boolean;
}

export default function AdminDashboardClient({
  dashboardStats,
  recentActivity,
  pendingItems,
  topUsers,
  isLoading,
}: AdminDashboardClientProps) {
  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="admin-loading-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {dashboardStats.map((stat) => {
          const StatIcon = STAT_ICONS[stat.label] || Users;
          return (
          <div key={stat.label} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              <StatIcon className="w-6 h-6" />
            </div>
            <div className="admin-stat-content">
              <span className="admin-stat-value">{stat.value}</span>
              <span className="admin-stat-label">{stat.label}</span>
            </div>
            <span className={`admin-stat-change ${stat.changeType}`}>
              {stat.change}
            </span>
          </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="admin-dashboard-grid">
        {/* Recent Activity */}
        <div className="admin-card admin-activity-card">
          <div className="admin-card-header">
            <h2>Recent Activity</h2>
            <a href="/admin/activity" className="admin-card-link">View All</a>
          </div>
          <div className="admin-activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const ActivityIcon = ACTIVITY_ICONS[activity.type] || FileText;
                return (
                <div key={index} className="admin-activity-item">
                  <div className={`admin-activity-icon ${activity.type}`}>
                    <ActivityIcon className="w-4 h-4" />
                  </div>
                  <div className="admin-activity-content">
                    <p>{activity.message}</p>
                    <span className="admin-activity-time">{activity.time}</span>
                  </div>
                </div>
                );
              })
            ) : (
              <div className="admin-empty-state">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Items */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Pending Items</h2>
          </div>
          <div className="admin-pending-list">
            {pendingItems.map((item) => (
              <div key={item.type} className="admin-pending-item">
                <span className="admin-pending-label">{item.type}</span>
                <span
                  className="admin-pending-count"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Top Contributors</h2>
            <a href="/admin/users" className="admin-card-link">View All</a>
          </div>
          <div className="admin-users-table">
            <div className="admin-table-header">
              <span>User</span>
              <span>Posts</span>
              <span>Rep</span>
            </div>
            {topUsers.length > 0 ? (
              topUsers.map((user, index) => (
                <div key={user.id} className="admin-table-row">
                  <span className="admin-user-rank">
                    #{index + 1} {user.display_name || user.username}
                  </span>
                  <span>{user.post_count.toLocaleString()}</span>
                  <span className="admin-user-rep">{user.reputation.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="admin-empty-state">
                <p>No users yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="admin-quick-actions">
            <button className="admin-action-btn">
              <UserPlus className="w-5 h-5" />
              Add User
            </button>
            <button className="admin-action-btn">
              <FileText className="w-5 h-5" />
              New Announcement
            </button>
            <button className="admin-action-btn">
              <Flag className="w-5 h-5" />
              Review Reports
            </button>
            <button className="admin-action-btn warning">
              <AlertTriangle className="w-5 h-5" />
              Ban User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
