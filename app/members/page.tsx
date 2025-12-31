import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Medal,
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
} from 'lucide-react';
import { getAllUsers, type User } from '@/lib/db/queries';
import { formatNumber } from '@/lib/utils';
import MembersClient from '@/components/members/MembersClient';

// Role badge component
function RoleBadge({ role }: { role: User['role'] }) {
  const styles = {
    admin: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <Crown className="h-3 w-3" /> },
    moderator: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <Shield className="h-3 w-3" /> },
    vip: { bg: 'bg-pink-500/20', text: 'text-pink-400', icon: <Gem className="h-3 w-3" /> },
    member: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: <Users className="h-3 w-3" /> },
  } as const;

  const style = styles[role as keyof typeof styles] || styles.member;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

export default async function MembersPage() {
  const users = await getAllUsers(100);

  // Calculate stats
  const totalUsers = users.length;
  const totalPosts = users.reduce((sum, u) => sum + (u.post_count || 0), 0);
  const totalReputation = users.reduce((sum, u) => sum + (u.reputation || 0), 0);

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
            <div className="text-2xl font-bold text-white">{formatNumber(totalUsers)}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Online Now
            </div>
            <div className="text-2xl font-bold text-green-400">0</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <MessageSquare className="h-4 w-4" />
              Total Posts
            </div>
            <div className="text-2xl font-bold text-purple-400">{formatNumber(totalPosts)}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Star className="h-4 w-4" />
              Total Reputation
            </div>
            <div className="text-2xl font-bold text-pink-400">{formatNumber(totalReputation)}</div>
          </div>
        </div>

        {/* Client-side filtering and sorting */}
        <MembersClient users={users} RoleBadge={RoleBadge} />
      </div>
    </div>
  );
}
