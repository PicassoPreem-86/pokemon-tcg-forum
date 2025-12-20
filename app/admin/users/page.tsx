import React from 'react';
import { requireAdmin } from '@/lib/auth/admin-check';
import { getAllUsers } from '@/lib/actions/admin';
import AdminUsersClient from './page-client';
import type { UserRole } from '@/lib/supabase/database.types';

interface AdminUsersPageProps {
  searchParams: Promise<{ search?: string; role?: string; status?: string }>;
}

// Valid user roles for filtering
const validRoles: UserRole[] = ['newbie', 'member', 'vip', 'moderator', 'admin'];

export default async function AdminUsers({ searchParams }: AdminUsersPageProps) {
  // Verify admin access
  await requireAdmin('/admin/users');

  // Await searchParams
  const params = await searchParams;

  // Validate role parameter
  const roleFilter = params.role && validRoles.includes(params.role as UserRole)
    ? (params.role as UserRole)
    : undefined;

  // Fetch real user data
  const usersResult = await getAllUsers({
    search: params.search,
    role: roleFilter,
    limit: 50,
    offset: 0,
  });

  const users = usersResult.success ? usersResult.data!.users : [];
  const total = usersResult.success ? usersResult.data!.total : 0;

  // Transform data for client component
  const transformedUsers = users.map((profile) => ({
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name || profile.username,
    email: 'email@hidden.com', // Don't expose emails in UI
    avatar: profile.avatar_url || '/images/avatars/default.png',
    role: profile.role,
    status: 'active', // TODO: Add status field to profiles
    joinDate: new Date(profile.created_at).toLocaleDateString(),
    lastActive: profile.updated_at
      ? formatTimeAgo(new Date(profile.updated_at))
      : 'Never',
    posts: profile.post_count,
    reputation: profile.reputation,
  }));

  return (
    <AdminUsersClient
      initialUsers={transformedUsers}
      totalUsers={total}
      initialSearch={params.search || ''}
      initialRoleFilter={params.role || 'all'}
      initialStatusFilter={params.status || 'all'}
    />
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}
