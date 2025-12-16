import { MessageSquare, Users, FileText, TrendingUp } from 'lucide-react';
import { ForumStatistics } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

interface ForumStatsProps {
  stats: ForumStatistics;
  variant?: 'inline' | 'card' | 'detailed';
}

export default function ForumStats({ stats, variant = 'card' }: ForumStatsProps) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-dark-400">
          <FileText className="h-4 w-4" />
          <span>{formatNumber(stats.totalThreads)} threads</span>
        </div>
        <div className="flex items-center gap-2 text-dark-400">
          <MessageSquare className="h-4 w-4" />
          <span>{formatNumber(stats.totalPosts)} posts</span>
        </div>
        <div className="flex items-center gap-2 text-dark-400">
          <Users className="h-4 w-4" />
          <span>{formatNumber(stats.totalMembers)} members</span>
        </div>
        <div className="flex items-center gap-2 text-pikachu-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{formatNumber(stats.onlineUsers)} online</span>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="p-4 border-b border-dark-700">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-pikachu-500" />
            Forum Statistics
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-dark-750 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {formatNumber(stats.totalThreads)}
              </div>
              <div className="text-xs text-dark-400">Threads</div>
            </div>
            <div className="text-center p-3 bg-dark-750 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {formatNumber(stats.totalPosts)}
              </div>
              <div className="text-xs text-dark-400">Posts</div>
            </div>
            <div className="text-center p-3 bg-dark-750 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {formatNumber(stats.totalMembers)}
              </div>
              <div className="text-xs text-dark-400">Members</div>
            </div>
            <div className="text-center p-3 bg-dark-750 rounded-lg">
              <div className="text-2xl font-bold text-pikachu-500">
                {formatNumber(stats.onlineUsers)}
              </div>
              <div className="text-xs text-dark-400">Online Now</div>
            </div>
          </div>

          {/* Today's Stats */}
          {stats.todayStats && (
            <div className="pt-4 border-t border-dark-700">
              <h4 className="text-xs font-semibold text-dark-400 mb-3">Today</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">New threads</span>
                <span className="text-white">{stats.todayStats.newThreads}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-dark-400">New posts</span>
                <span className="text-white">{stats.todayStats.newPosts}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-dark-400">New members</span>
                <span className="text-white">{stats.todayStats.newMembers}</span>
              </div>
            </div>
          )}

          {/* Newest Member */}
          <div className="pt-4 border-t border-dark-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-dark-400">Newest member</span>
              <span className="text-sm text-pikachu-500 font-medium">
                {stats.newestMember.username}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-pikachu-500" />
        Community Stats
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <StatItem
          icon={<FileText className="h-5 w-5" />}
          label="Threads"
          value={formatNumber(stats.totalThreads)}
        />
        <StatItem
          icon={<MessageSquare className="h-5 w-5" />}
          label="Posts"
          value={formatNumber(stats.totalPosts)}
        />
        <StatItem
          icon={<Users className="h-5 w-5" />}
          label="Members"
          value={formatNumber(stats.totalMembers)}
        />
        <StatItem
          icon={
            <div className="relative">
              <Users className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          }
          label="Online"
          value={formatNumber(stats.onlineUsers)}
          highlight
        />
      </div>
    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function StatItem({ icon, label, value, highlight }: StatItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`text-${highlight ? 'pikachu-500' : 'dark-500'}`}>
        {icon}
      </div>
      <div>
        <div className={`text-lg font-bold ${highlight ? 'text-pikachu-500' : 'text-white'}`}>
          {value}
        </div>
        <div className="text-xs text-dark-500">{label}</div>
      </div>
    </div>
  );
}
