'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  Search,
  ChevronUp,
  ChevronDown,
  Heart,
  MessageSquare,
  FileText,
  Eye,
  BookOpen,
  Calendar,
  Star,
  Crown,
  Shield,
  Gem,
  Users,
  Filter,
} from 'lucide-react';
import { MOCK_USERS, User, LeaderboardSortKey, getLeaderboard, searchUsers } from '@/lib/mock-data/users';

// Time period options
type TimePeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all';

// Role filter options
type RoleFilter = 'all' | 'admin' | 'moderator' | 'vip' | 'member';

// Sort configuration
interface SortConfig {
  key: LeaderboardSortKey;
  direction: 'asc' | 'desc';
}

// Column definition
interface Column {
  key: LeaderboardSortKey;
  label: string;
  icon: React.ReactNode;
  shortLabel?: string;
}

const COLUMNS: Column[] = [
  { key: 'likesGiven', label: 'Likes Given', shortLabel: 'Given', icon: <Heart className="h-4 w-4" /> },
  { key: 'likesReceived', label: 'Likes Received', shortLabel: 'Received', icon: <Heart className="h-4 w-4 fill-current" /> },
  { key: 'threadsCreated', label: 'Topics Created', shortLabel: 'Topics', icon: <FileText className="h-4 w-4" /> },
  { key: 'postCount', label: 'Replies Posted', shortLabel: 'Replies', icon: <MessageSquare className="h-4 w-4" /> },
  { key: 'topicsViewed', label: 'Topics Viewed', shortLabel: 'Viewed', icon: <Eye className="h-4 w-4" /> },
  { key: 'postsRead', label: 'Posts Read', shortLabel: 'Read', icon: <BookOpen className="h-4 w-4" /> },
  { key: 'daysVisited', label: 'Days Visited', shortLabel: 'Days', icon: <Calendar className="h-4 w-4" /> },
];

// Role badge component
function RoleBadge({ role }: { role: User['role'] }) {
  const styles = {
    admin: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <Crown className="h-3 w-3" /> },
    moderator: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <Shield className="h-3 w-3" /> },
    vip: { bg: 'bg-pink-500/20', text: 'text-pink-400', icon: <Gem className="h-3 w-3" /> },
    member: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: <Users className="h-3 w-3" /> },
  };

  const style = styles[role] || styles.member;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

// Rank badge component
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-white font-bold shadow-lg shadow-yellow-500/30">
        <Trophy className="h-4 w-4" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-white font-bold shadow-lg shadow-slate-400/30">
        <Medal className="h-4 w-4" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold shadow-lg shadow-amber-600/30">
        <Medal className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/50 text-slate-300 font-medium text-sm">
      {rank}
    </div>
  );
}

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'reputation',
    direction: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let users = [...MOCK_USERS];

    // Apply search filter
    if (searchQuery.trim()) {
      users = searchUsers(searchQuery);
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      users = users.filter((user) => user.role === roleFilter);
    }

    // Apply sorting
    users.sort((a, b) => {
      const aVal = a[sortConfig.key] || 0;
      const bVal = b[sortConfig.key] || 0;
      return sortConfig.direction === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return users;
  }, [searchQuery, roleFilter, sortConfig]);

  // Handle column sort
  const handleSort = (key: LeaderboardSortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  // Get sort indicator
  const getSortIndicator = (key: LeaderboardSortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'desc' ? (
      <ChevronDown className="h-3 w-3" />
    ) : (
      <ChevronUp className="h-3 w-3" />
    );
  };

  // Stats summary
  const stats = useMemo(() => {
    const totalUsers = MOCK_USERS.length;
    const onlineUsers = MOCK_USERS.filter((u) => u.isOnline).length;
    const totalPosts = MOCK_USERS.reduce((sum, u) => sum + (u.postCount || 0), 0);
    const totalLikes = MOCK_USERS.reduce((sum, u) => sum + (u.likesReceived || 0), 0);
    return { totalUsers, onlineUsers, totalPosts, totalLikes };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
              <Trophy className="h-6 w-6 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-slate-400">
            Community rankings based on activity and engagement
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Users className="h-4 w-4" />
              Total Members
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Online Now
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.onlineUsers.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <MessageSquare className="h-4 w-4" />
              Total Posts
            </div>
            <div className="text-2xl font-bold text-purple-400">{stats.totalPosts.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Heart className="h-4 w-4" />
              Total Likes
            </div>
            <div className="text-2xl font-bold text-pink-400">{stats.totalLikes.toLocaleString()}</div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Time Period Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm hidden sm:inline">Period:</span>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                className="px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="quarterly">This Quarter</option>
                <option value="yearly">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm hidden sm:inline">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="moderator">Moderators</option>
                <option value="vip">VIP</option>
                <option value="member">Members</option>
              </select>
            </div>

            {/* Quick Sort Buttons */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <Filter className="h-4 w-4" />
              Sort Options
            </button>
          </div>

          {/* Mobile Sort Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-700/50 lg:hidden">
              <div className="text-sm text-slate-400 mb-2">Sort by:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSort('reputation')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    sortConfig.key === 'reputation'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Reputation
                </button>
                {COLUMNS.map((col) => (
                  <button
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      sortConfig.key === col.key
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {col.shortLabel || col.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard Table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-16">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Member
                  </th>
                  <th
                    onClick={() => handleSort('reputation')}
                    className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4" />
                      Rep
                      {getSortIndicator('reputation')}
                    </div>
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-3 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1">
                        {col.icon}
                        <span className="hidden xl:inline">{col.shortLabel || col.label}</span>
                        {getSortIndicator(col.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <RankBadge rank={index + 1} />
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/u/${user.username}`} className="flex items-center gap-3 group">
                        <div className="relative">
                          <img
                            src={user.avatar}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full bg-slate-700 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/avatars/default.png';
                            }}
                          />
                          {user.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-800" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white group-hover:text-purple-400 transition-colors">
                            {user.displayName}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">@{user.username}</span>
                            <RoleBadge role={user.role} />
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="font-medium text-yellow-400">
                          {(user.reputation || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="px-3 py-4 text-center text-slate-300">
                        {((user[col.key] as number) || 0).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-slate-700/30">
            {filteredUsers.map((user, index) => (
              <Link
                key={user.id}
                href={`/u/${user.username}`}
                className="block p-4 hover:bg-slate-700/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <RankBadge rank={index + 1} />
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full bg-slate-700 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/avatars/default.png';
                      }}
                    />
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white truncate">{user.displayName}</span>
                      <RoleBadge role={user.role} />
                    </div>
                    <div className="text-sm text-slate-400">@{user.username}</div>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-3 w-3" />
                        {(user.reputation || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <MessageSquare className="h-3 w-3" />
                        {(user.postCount || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-pink-400">
                        <Heart className="h-3 w-3" />
                        {(user.likesReceived || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No members found</h3>
              <p className="text-slate-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mt-4 text-center text-sm text-slate-400">
          Showing {filteredUsers.length} of {MOCK_USERS.length} members
        </div>
      </div>
    </div>
  );
}
