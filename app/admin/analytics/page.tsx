'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Eye,
  FileText,
  Calendar,
  ArrowUp,
  ArrowDown,
  Activity,
  BarChart3,
  PieChart,
  Clock,
} from 'lucide-react';

// Mock analytics data
const overviewStats = [
  {
    label: 'Total Page Views',
    value: '2.4M',
    change: '+18.2%',
    changeType: 'positive',
    icon: Eye,
    color: '#3B82F6',
  },
  {
    label: 'Unique Visitors',
    value: '156.8K',
    change: '+12.5%',
    changeType: 'positive',
    icon: Users,
    color: '#10B981',
  },
  {
    label: 'New Threads',
    value: '3,247',
    change: '+8.3%',
    changeType: 'positive',
    icon: FileText,
    color: '#F59E0B',
  },
  {
    label: 'New Posts',
    value: '28,934',
    change: '-2.1%',
    changeType: 'negative',
    icon: MessageSquare,
    color: '#8B5CF6',
  },
];

const trafficData = [
  { day: 'Mon', views: 42000, visitors: 12400 },
  { day: 'Tue', views: 38000, visitors: 11200 },
  { day: 'Wed', views: 45000, visitors: 13800 },
  { day: 'Thu', views: 52000, visitors: 15600 },
  { day: 'Fri', views: 48000, visitors: 14200 },
  { day: 'Sat', views: 61000, visitors: 18900 },
  { day: 'Sun', views: 58000, visitors: 17400 },
];

const categoryStats = [
  { name: 'Buy & Trade', threads: 5678, posts: 123456, percentage: 28 },
  { name: 'General', threads: 4523, posts: 89234, percentage: 22 },
  { name: 'Collecting', threads: 3847, posts: 67892, percentage: 18 },
  { name: 'Market', threads: 2156, posts: 34567, percentage: 12 },
  { name: 'Grading', threads: 1890, posts: 28945, percentage: 10 },
  { name: 'News & Links', threads: 892, posts: 45678, percentage: 6 },
  { name: 'Articles', threads: 567, posts: 12345, percentage: 4 },
];

const userGrowthData = [
  { month: 'Jul', newUsers: 2340, totalUsers: 38000 },
  { month: 'Aug', newUsers: 2890, totalUsers: 40890 },
  { month: 'Sep', newUsers: 3120, totalUsers: 44010 },
  { month: 'Oct', newUsers: 2780, totalUsers: 46790 },
  { month: 'Nov', newUsers: 3450, totalUsers: 50240 },
  { month: 'Dec', newUsers: 4100, totalUsers: 54340 },
];

const topThreads = [
  { title: 'Prismatic Evolutions - Full Set List Revealed!', views: 89234, replies: 1247 },
  { title: 'Complete Guide: How to spot fake Pokemon cards', views: 67891, replies: 892 },
  { title: 'PSA vs CGC - Which grading service is better?', views: 54321, replies: 756 },
  { title: 'My $100,000 Vintage Pokemon Collection', views: 48765, replies: 634 },
  { title: 'TCG Pocket: Best Meta Decks Tier List', views: 43210, replies: 521 },
];

const peakHours = [
  { hour: '6 AM', activity: 15 },
  { hour: '9 AM', activity: 45 },
  { hour: '12 PM', activity: 72 },
  { hour: '3 PM', activity: 58 },
  { hour: '6 PM', activity: 85 },
  { hour: '9 PM', activity: 100 },
  { hour: '12 AM', activity: 42 },
];

const deviceStats = [
  { device: 'Desktop', percentage: 52, color: '#3B82F6' },
  { device: 'Mobile', percentage: 38, color: '#10B981' },
  { device: 'Tablet', percentage: 10, color: '#F59E0B' },
];

const topCountries = [
  { country: 'United States', visitors: 45234, percentage: 35 },
  { country: 'United Kingdom', visitors: 18923, percentage: 15 },
  { country: 'Japan', visitors: 15678, percentage: 12 },
  { country: 'Canada', visitors: 12456, percentage: 10 },
  { country: 'Australia', visitors: 9876, percentage: 8 },
];

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');

  const maxTraffic = Math.max(...trafficData.map((d) => d.views));

  return (
    <div className="admin-analytics">
      {/* Time Range Selector */}
      <div className="admin-analytics-header">
        <div className="admin-analytics-title">
          <BarChart3 className="w-6 h-6" />
          <h2>Forum Analytics</h2>
        </div>
        <div className="admin-time-selector">
          <button
            className={timeRange === '24h' ? 'active' : ''}
            onClick={() => setTimeRange('24h')}
          >
            24h
          </button>
          <button
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button
            className={timeRange === '30d' ? 'active' : ''}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button
            className={timeRange === '90d' ? 'active' : ''}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="admin-analytics-stats">
        {overviewStats.map((stat) => (
          <div key={stat.label} className="admin-analytics-stat">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
            <span className={`stat-change ${stat.changeType}`}>
              {stat.changeType === 'positive' ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="admin-analytics-grid">
        {/* Traffic Chart */}
        <div className="admin-analytics-card large">
          <div className="admin-card-header">
            <h3><Activity className="w-5 h-5" /> Traffic Overview</h3>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot blue" /> Page Views</span>
              <span className="legend-item"><span className="legend-dot green" /> Visitors</span>
            </div>
          </div>
          <div className="admin-chart traffic-chart">
            {trafficData.map((data, index) => (
              <div key={data.day} className="chart-bar-group">
                <div className="chart-bars">
                  <div
                    className="chart-bar views"
                    style={{ height: `${(data.views / maxTraffic) * 100}%` }}
                    title={`${data.views.toLocaleString()} views`}
                  />
                  <div
                    className="chart-bar visitors"
                    style={{ height: `${(data.visitors / maxTraffic) * 100}%` }}
                    title={`${data.visitors.toLocaleString()} visitors`}
                  />
                </div>
                <span className="chart-label">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="admin-analytics-card">
          <div className="admin-card-header">
            <h3><PieChart className="w-5 h-5" /> Category Activity</h3>
          </div>
          <div className="admin-category-stats">
            {categoryStats.map((cat, index) => (
              <div key={cat.name} className="category-stat-row">
                <div className="category-info">
                  <span className="category-name">{cat.name}</span>
                  <span className="category-count">{cat.threads.toLocaleString()} threads</span>
                </div>
                <div className="category-bar-container">
                  <div
                    className="category-bar"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: `hsl(${index * 45}, 70%, 50%)`,
                    }}
                  />
                </div>
                <span className="category-percentage">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth */}
        <div className="admin-analytics-card">
          <div className="admin-card-header">
            <h3><Users className="w-5 h-5" /> User Growth</h3>
          </div>
          <div className="admin-user-growth">
            {userGrowthData.map((data) => (
              <div key={data.month} className="growth-item">
                <span className="growth-month">{data.month}</span>
                <div className="growth-stats">
                  <span className="growth-new">+{data.newUsers.toLocaleString()}</span>
                  <span className="growth-total">{data.totalUsers.toLocaleString()} total</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Activity Hours */}
        <div className="admin-analytics-card">
          <div className="admin-card-header">
            <h3><Clock className="w-5 h-5" /> Peak Activity Hours</h3>
          </div>
          <div className="admin-peak-hours">
            {peakHours.map((data) => (
              <div key={data.hour} className="peak-hour-row">
                <span className="peak-hour-label">{data.hour}</span>
                <div className="peak-hour-bar-container">
                  <div
                    className="peak-hour-bar"
                    style={{ width: `${data.activity}%` }}
                  />
                </div>
                <span className="peak-hour-value">{data.activity}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Threads */}
        <div className="admin-analytics-card">
          <div className="admin-card-header">
            <h3><TrendingUp className="w-5 h-5" /> Top Threads This Week</h3>
          </div>
          <div className="admin-top-threads">
            {topThreads.map((thread, index) => (
              <div key={thread.title} className="top-thread-item">
                <span className="thread-rank">#{index + 1}</span>
                <div className="thread-info">
                  <span className="thread-title">{thread.title}</span>
                  <div className="thread-stats">
                    <span><Eye className="w-3 h-3" /> {thread.views.toLocaleString()}</span>
                    <span><MessageSquare className="w-3 h-3" /> {thread.replies.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="admin-analytics-card small">
          <div className="admin-card-header">
            <h3>Device Breakdown</h3>
          </div>
          <div className="admin-device-stats">
            {deviceStats.map((device) => (
              <div key={device.device} className="device-stat">
                <div className="device-info">
                  <span
                    className="device-dot"
                    style={{ backgroundColor: device.color }}
                  />
                  <span className="device-name">{device.device}</span>
                </div>
                <span className="device-percentage">{device.percentage}%</span>
              </div>
            ))}
            <div className="device-visual">
              {deviceStats.map((device) => (
                <div
                  key={device.device}
                  className="device-segment"
                  style={{
                    width: `${device.percentage}%`,
                    backgroundColor: device.color,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="admin-analytics-card small">
          <div className="admin-card-header">
            <h3>Top Countries</h3>
          </div>
          <div className="admin-country-stats">
            {topCountries.map((country) => (
              <div key={country.country} className="country-stat">
                <span className="country-name">{country.country}</span>
                <div className="country-bar-container">
                  <div
                    className="country-bar"
                    style={{ width: `${country.percentage * 2.5}%` }}
                  />
                </div>
                <span className="country-visitors">{country.visitors.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="admin-analytics-actions">
        <button className="admin-btn secondary">
          <Calendar className="w-4 h-4" /> Schedule Report
        </button>
        <button className="admin-btn primary">
          <BarChart3 className="w-4 h-4" /> Export CSV
        </button>
      </div>
    </div>
  );
}
