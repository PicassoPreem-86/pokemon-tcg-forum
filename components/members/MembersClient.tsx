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
  Star,
  Users,
  Filter,
} from 'lucide-react';
import { type User } from '@/lib/db/queries';
import { formatNumber } from '@/lib/utils';

type SortKey = 'reputation' | 'post_count';
type RoleFilter = 'all' | 'admin' | 'moderator' | 'vip' | 'member';

interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

interface MembersClientProps {
  users: User[];
  RoleBadge: React.ComponentType<{ role: User['role'] }>;
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

export default function MembersClient({ users, RoleBadge }: MembersClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'reputation',
    direction: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.display_name?.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key] || 0;
      const bVal = b[sortConfig.key] || 0;
      return sortConfig.direction === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }, [users, searchQuery, roleFilter, sortConfig]);

  // Handle column sort
  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  // Get sort indicator
  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'desc' ? (
      <ChevronDown className="h-3 w-3" />
    ) : (
      <ChevronUp className="h-3 w-3" />
    );
  };

  return (
    <>
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
              <button
                onClick={() => handleSort('post_count')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  sortConfig.key === 'post_count'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Posts
              </button>
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
                    Reputation
                    {getSortIndicator('reputation')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('post_count')}
                  className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Posts
                    {getSortIndicator('post_count')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-4">
                    <RankBadge rank={index + 1} />
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/u/${user.username}`} className="flex items-center gap-3 group">
                      <div className="relative">
                        <img
                          src={user.avatar_url || '/images/avatars/default.png'}
                          alt={user.display_name || user.username}
                          className="w-10 h-10 rounded-full bg-slate-700 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/avatars/default.png';
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-purple-400 transition-colors">
                          {user.display_name || user.username}
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
                        {formatNumber(user.reputation || 0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-slate-300">
                    {formatNumber(user.post_count || 0)}
                  </td>
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
                    src={user.avatar_url || '/images/avatars/default.png'}
                    alt={user.display_name || user.username}
                    className="w-12 h-12 rounded-full bg-slate-700 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/avatars/default.png';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white truncate">
                      {user.display_name || user.username}
                    </span>
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="text-sm text-slate-400">@{user.username}</div>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-3 w-3" />
                      {formatNumber(user.reputation || 0)}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MessageSquare className="h-3 w-3" />
                      {formatNumber(user.post_count || 0)}
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
            <p className="text-slate-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mt-4 text-center text-sm text-slate-400">
        Showing {filteredUsers.length} of {users.length} members
      </div>
    </>
  );
}
