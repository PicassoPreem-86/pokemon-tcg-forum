import React from 'react';
import { requireAdmin } from '@/lib/auth/admin-check';
import { getAdminStats, getRecentActivity, getTopContributors } from '@/lib/actions/admin';
import AdminDashboardClient from './page-client';

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Verify admin access
  await requireAdmin('/admin');

  // Fetch real data from server actions
  const [statsResult, activityResult, contributorsResult] = await Promise.all([
    getAdminStats(),
    getRecentActivity(6),
    getTopContributors(5),
  ]);

  // Extract data or use defaults
  const stats = statsResult.success ? statsResult.data! : null;
  const recentActivity = activityResult.success ? activityResult.data! : [];
  const topUsers = contributorsResult.success ? contributorsResult.data! : [];

  // Calculate percentage changes (mock for now - would need historical data)
  // Note: Icons are resolved in the client component based on label
  const dashboardStats = stats ? [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+12%', // TODO: Calculate from historical data
      changeType: 'positive' as const,
      color: '#3B82F6',
    },
    {
      label: 'Total Posts',
      value: stats.totalPosts.toLocaleString(),
      change: '+8%',
      changeType: 'positive' as const,
      color: '#10B981',
    },
    {
      label: 'Active Today',
      value: stats.activeToday.toLocaleString(),
      change: `+${stats.newUsersToday}`,
      changeType: 'positive' as const,
      color: '#F59E0B',
    },
    {
      label: 'Total Threads',
      value: stats.totalThreads.toLocaleString(),
      change: `+${stats.newThreadsToday}`,
      changeType: 'positive' as const,
      color: '#8B5CF6',
    },
  ] : [];

  const pendingItems = stats ? [
    { type: 'Reports', count: stats.pendingReports, color: '#EF4444' },
    { type: 'New Users', count: stats.newUsersToday, color: '#3B82F6' },
    { type: 'New Posts', count: stats.newPostsToday, color: '#10B981' },
    { type: 'Banned Users', count: stats.bannedUsers, color: '#F59E0B' },
  ] : [];

  // Format activity items for display
  // Note: Icons are resolved in the client component based on type
  const formattedActivity = recentActivity.map((item) => {
    // Calculate time ago
    const timestamp = new Date(item.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let timeAgo = 'just now';
    if (diffMins < 60) {
      timeAgo = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    return {
      type: item.type,
      message: item.message,
      time: timeAgo,
    };
  });

  return (
    <AdminDashboardClient
      dashboardStats={dashboardStats}
      recentActivity={formattedActivity}
      pendingItems={pendingItems}
      topUsers={topUsers}
      isLoading={!stats}
    />
  );
}
