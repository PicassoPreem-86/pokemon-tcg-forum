'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Filter,
  MoreVertical,
  Shield,
  Ban,
  Mail,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown,
} from 'lucide-react';

// Mock users data
const mockUsers = [
  {
    id: '1',
    username: 'CharizardCollector',
    displayName: 'Charizard Collector',
    email: 'charizard@example.com',
    avatar: '/images/avatars/default.png',
    role: 'member',
    status: 'active',
    joinDate: '2024-01-15',
    lastActive: '2 hours ago',
    posts: 1247,
    reputation: 8932,
  },
  {
    id: '2',
    username: 'PikachuTrader',
    displayName: 'Pikachu Trader',
    email: 'pikachu@example.com',
    avatar: '/images/avatars/default.png',
    role: 'moderator',
    status: 'active',
    joinDate: '2023-06-20',
    lastActive: '5 minutes ago',
    posts: 892,
    reputation: 7654,
  },
  {
    id: '3',
    username: 'MewtwoMaster',
    displayName: 'Mewtwo Master',
    email: 'mewtwo@example.com',
    avatar: '/images/avatars/default.png',
    role: 'vip',
    status: 'active',
    joinDate: '2023-09-10',
    lastActive: '1 day ago',
    posts: 756,
    reputation: 6543,
  },
  {
    id: '4',
    username: 'SpamBot123',
    displayName: 'Spam Bot',
    email: 'spam@example.com',
    avatar: '/images/avatars/default.png',
    role: 'newbie',
    status: 'banned',
    joinDate: '2024-12-01',
    lastActive: 'N/A',
    posts: 23,
    reputation: -50,
  },
  {
    id: '5',
    username: 'EeveeEnthusiast',
    displayName: 'Eevee Enthusiast',
    email: 'eevee@example.com',
    avatar: '/images/avatars/default.png',
    role: 'member',
    status: 'active',
    joinDate: '2024-03-22',
    lastActive: '3 hours ago',
    posts: 634,
    reputation: 5432,
  },
  {
    id: '6',
    username: 'NewTrainer2024',
    displayName: 'New Trainer',
    email: 'new@example.com',
    avatar: '/images/avatars/default.png',
    role: 'newbie',
    status: 'pending',
    joinDate: '2024-12-15',
    lastActive: 'Never',
    posts: 0,
    reputation: 0,
  },
];

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

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <div className="admin-users">
      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search className="w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            <button className="admin-bulk-btn warning">
              <Ban className="w-4 h-4" /> Ban
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
                      <span className="admin-user-email">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className="admin-badge"
                    style={{ backgroundColor: `${roleColors[user.role]}20`, color: roleColors[user.role] }}
                  >
                    {user.role === 'admin' && <Shield className="w-3 h-3" />}
                    {user.role === 'moderator' && <Shield className="w-3 h-3" />}
                    {user.role === 'vip' && <Crown className="w-3 h-3" />}
                    {user.role}
                  </span>
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
                    <button className="admin-action-icon" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="admin-action-icon" title="Email">
                      <Mail className="w-4 h-4" />
                    </button>
                    {user.status === 'banned' ? (
                      <button className="admin-action-icon success" title="Unban">
                        <UserCheck className="w-4 h-4" />
                      </button>
                    ) : (
                      <button className="admin-action-icon warning" title="Ban">
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                    <button className="admin-action-icon danger" title="Delete">
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
        <span>Showing {filteredUsers.length} of {mockUsers.length} users</span>
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
