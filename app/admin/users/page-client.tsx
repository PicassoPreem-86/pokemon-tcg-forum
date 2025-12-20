'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Shield,
  Mail,
  Edit,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { updateUserRole, deleteUser } from '@/lib/actions/admin';
import {
  banUser,
  unbanUser,
  suspendUser,
} from '@/lib/actions/admin-moderation';
import type { UserRole } from '@/lib/supabase/database.types';

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: string;
  joinDate: string;
  lastActive: string;
  posts: number;
  reputation: number;
}

interface AdminUsersClientProps {
  initialUsers: User[];
  totalUsers: number;
  initialSearch: string;
  initialRoleFilter: string;
  initialStatusFilter: string;
}

const roleColors: Record<string, string> = {
  admin: '#EF4444',
  moderator: '#8B5CF6',
  vip: '#F59E0B',
  member: '#3B82F6',
  newbie: '#6B7280',
};

const statusColors: Record<string, string> = {
  active: '#10B981',
  banned: '#EF4444',
  pending: '#F59E0B',
  suspended: '#F97316',
};

export default function AdminUsersClient({
  initialUsers,
  totalUsers,
  initialSearch,
  initialRoleFilter,
  initialStatusFilter,
}: AdminUsersClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    setActionInProgress(userId);
    const result = await updateUserRole(userId, newRole);

    if (result.success) {
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      alert('User role updated successfully');
    } else {
      alert(result.error || 'Failed to update user role');
    }
    setActionInProgress(null);
  };

  const handleBanUser = async (userId: string, username: string) => {
    const reason = prompt(`Enter reason for banning ${username}:`);
    if (!reason) return;

    const duration = prompt(
      'Enter ban duration in days (leave empty for permanent ban):'
    );
    const days = duration ? parseInt(duration, 10) : undefined;

    setActionInProgress(userId);
    const result = await banUser(userId, reason, days);

    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'banned' } : u))
      );
      alert(`User banned successfully${days ? ` for ${days} days` : ' permanently'}`);
    } else {
      alert(result.error || 'Failed to ban user');
    }
    setActionInProgress(null);
  };

  const handleUnbanUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to unban ${username}?`)) {
      return;
    }

    setActionInProgress(userId);
    const result = await unbanUser(userId);

    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u))
      );
      alert('User unbanned successfully');
    } else {
      alert(result.error || 'Failed to unban user');
    }
    setActionInProgress(null);
  };

  const handleSuspendUser = async (userId: string, username: string) => {
    const reason = prompt(`Enter reason for suspending ${username}:`);
    if (!reason) return;

    const daysInput = prompt('Enter suspension duration in days (1-365):');
    if (!daysInput) return;

    const days = parseInt(daysInput, 10);
    if (isNaN(days) || days < 1 || days > 365) {
      alert('Invalid duration. Must be between 1 and 365 days.');
      return;
    }

    setActionInProgress(userId);
    const result = await suspendUser(userId, reason, days);

    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' } : u))
      );
      alert(`User suspended successfully for ${days} days`);
    } else {
      alert(result.error || 'Failed to suspend user');
    }
    setActionInProgress(null);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete ${username}? This action cannot be undone.`)) {
      return;
    }

    setActionInProgress(userId);
    const result = await deleteUser(userId, false);

    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert('User deleted successfully');
    } else {
      alert(result.error || 'Failed to delete user');
    }
    setActionInProgress(null);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchQuery(newSearch);
    startTransition(() => {
      const params = new URLSearchParams();
      if (newSearch) params.set('search', newSearch);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      router.push(`/admin/users${params.toString() ? `?${params.toString()}` : ''}`);
    });
  };

  return (
    <div className="admin-users">
      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search className="w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="admin-filters">
          <div className="admin-filter">
            <Filter className="w-4 h-4" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="vip">VIP</option>
              <option value="member">Member</option>
              <option value="newbie">Newbie</option>
            </select>
          </div>
          <div className="admin-filter">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="admin-bulk-actions">
            <span>{selectedUsers.length} selected</span>
            <button className="admin-bulk-btn">
              <Mail className="w-4 h-4" /> Email
            </button>
            <button
              className="admin-bulk-btn warning"
              onClick={() => {
                if (confirm('Ban all selected users?')) {
                  alert('Bulk ban functionality coming soon');
                }
              }}
            >
              <UserX className="w-4 h-4" /> Ban
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleAllUsers}
                />
              </th>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Last Active</th>
              <th>Posts</th>
              <th>Rep</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className={user.status === 'banned' ? 'banned' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    disabled={actionInProgress === user.id}
                  />
                </td>
                <td>
                  <div className="admin-user-cell">
                    <Image
                      src={user.avatar}
                      alt={user.displayName}
                      width={36}
                      height={36}
                      className="admin-user-avatar-sm"
                    />
                    <div>
                      <span className="admin-user-name">{user.displayName}</span>
                      <span className="admin-user-email">@{user.username}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                    disabled={actionInProgress === user.id}
                    className="admin-role-select"
                    style={{
                      backgroundColor: `${roleColors[user.role]}20`,
                      color: roleColors[user.role],
                      border: `1px solid ${roleColors[user.role]}40`,
                    }}
                  >
                    <option value="newbie">Newbie</option>
                    <option value="member">Member</option>
                    <option value="vip">VIP</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span
                    className="admin-status"
                    style={{ backgroundColor: `${statusColors[user.status]}20`, color: statusColors[user.status] }}
                  >
                    {user.status}
                  </span>
                </td>
                <td>{user.joinDate}</td>
                <td>{user.lastActive}</td>
                <td>{user.posts.toLocaleString()}</td>
                <td className={user.reputation < 0 ? 'negative' : ''}>{user.reputation.toLocaleString()}</td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-action-icon" title="Edit" disabled={actionInProgress === user.id}>
                      <Edit className="w-4 h-4" />
                    </button>
                    {user.status === 'banned' ? (
                      <button
                        className="admin-action-icon success"
                        title="Unban"
                        onClick={() => handleUnbanUser(user.id, user.username)}
                        disabled={actionInProgress === user.id}
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    ) : user.status === 'suspended' ? (
                      <button
                        className="admin-action-icon warning"
                        title="Suspended - Click to Ban"
                        onClick={() => handleBanUser(user.id, user.username)}
                        disabled={actionInProgress === user.id}
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          className="admin-action-icon warning"
                          title="Suspend"
                          onClick={() => handleSuspendUser(user.id, user.username)}
                          disabled={actionInProgress === user.id}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          className="admin-action-icon danger"
                          title="Ban"
                          onClick={() => handleBanUser(user.id, user.username)}
                          disabled={actionInProgress === user.id}
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      className="admin-action-icon danger"
                      title="Delete"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      disabled={actionInProgress === user.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="admin-pagination">
        <span>Showing {filteredUsers.length} of {totalUsers} users</span>
        <div className="admin-pagination-buttons">
          <button disabled>Previous</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>Next</button>
        </div>
      </div>
    </div>
  );
}
