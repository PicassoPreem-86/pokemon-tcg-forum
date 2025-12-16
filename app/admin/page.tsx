'use client';

import React from 'react';
import {
  Users,
  MessageSquare,
  TrendingUp,
  Eye,
  Flag,
  UserPlus,
  FileText,
  AlertTriangle,
} from 'lucide-react';

// Mock data for dashboard stats
const dashboardStats = [
  {
    label: 'Total Users',
    value: '45,723',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
    color: '#3B82F6',
  },
  {
    label: 'Total Posts',
    value: '456,891',
    change: '+8%',
    changeType: 'positive',
    icon: MessageSquare,
    color: '#10B981',
  },
  {
    label: 'Active Today',
    value: '1,247',
    change: '+23%',
    changeType: 'positive',
    icon: TrendingUp,
    color: '#F59E0B',
  },
  {
    label: 'Page Views',
    value: '89.2K',
    change: '+15%',
    changeType: 'positive',
    icon: Eye,
    color: '#8B5CF6',
  },
];

const recentActivity = [
  { type: 'user', message: 'New user registered: CharizardFan99', time: '2 minutes ago', icon: UserPlus },
  { type: 'post', message: 'New thread in Trading: "WTS PSA 10 Charizard"', time: '5 minutes ago', icon: FileText },
  { type: 'report', message: 'Post reported for spam in General', time: '12 minutes ago', icon: Flag },
  { type: 'user', message: 'New user registered: PikachuMaster', time: '15 minutes ago', icon: UserPlus },
  { type: 'warning', message: 'User banned: SpamBot123', time: '23 minutes ago', icon: AlertTriangle },
  { type: 'post', message: 'New thread in Collecting: "My PSA Collection"', time: '31 minutes ago', icon: FileText },
];

const pendingItems = [
  { type: 'Reports', count: 7, color: '#EF4444' },
  { type: 'New Users', count: 23, color: '#3B82F6' },
  { type: 'Flagged Posts', count: 4, color: '#F59E0B' },
  { type: 'Pending Reviews', count: 12, color: '#8B5CF6' },
];

const topUsers = [
  { name: 'CharizardCollector', posts: 1247, reputation: 8932 },
  { name: 'PikachuTrader', posts: 892, reputation: 7654 },
  { name: 'MewtwoMaster', posts: 756, reputation: 6543 },
  { name: 'EeveeEnthusiast', posts: 634, reputation: 5432 },
  { name: 'SquirtleSquad', posts: 521, reputation: 4321 },
];

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="admin-stat-content">
              <span className="admin-stat-value">{stat.value}</span>
              <span className="admin-stat-label">{stat.label}</span>
            </div>
            <span className={`admin-stat-change ${stat.changeType}`}>
              {stat.change}
            </span>
          </div>
        ))}
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
            {recentActivity.map((activity, index) => (
              <div key={index} className="admin-activity-item">
                <div className={`admin-activity-icon ${activity.type}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="admin-activity-content">
                  <p>{activity.message}</p>
                  <span className="admin-activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
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
            {topUsers.map((user, index) => (
              <div key={user.name} className="admin-table-row">
                <span className="admin-user-rank">#{index + 1} {user.name}</span>
                <span>{user.posts.toLocaleString()}</span>
                <span className="admin-user-rep">{user.reputation.toLocaleString()}</span>
              </div>
            ))}
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
