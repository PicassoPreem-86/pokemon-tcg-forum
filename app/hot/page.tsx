import Link from 'next/link';
import Image from 'next/image';
import {
  Flame,
  Pin,
  TrendingUp,
  Eye,
  MessageSquare,
  Clock,
  Zap,
  Sparkles,
} from 'lucide-react';
import { getHotThreads, getLatestThreads } from '@/lib/db/queries';
import { formatNumber } from '@/lib/categories-updated';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default async function HotPage() {
  // Fetch hot threads and latest threads for "rising" section
  const [hotThreads, latestThreads] = await Promise.all([
    getHotThreads(20),
    getLatestThreads(5),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/10 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                Hot & Trending
              </h1>
              <p className="text-slate-400 mt-2">
                The hottest discussions in the community right now
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Hot Threads */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Hot Threads</h2>
              <span className="text-sm text-slate-500">({hotThreads.length} threads)</span>
            </div>

            {hotThreads.length > 0 ? (
              <div className="space-y-3">
                {hotThreads.map((thread, index) => (
                  <div key={thread.id} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-all group">
                    {/* Rank */}
                    <div className="flex flex-col items-center justify-center min-w-[60px] px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <span className="text-xs text-slate-500 uppercase">Rank</span>
                      <span className="text-lg font-bold text-purple-400">#{index + 1}</span>
                    </div>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <Image
                        src={thread.author.avatar_url || '/images/avatars/default.png'}
                        alt={thread.author.username}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Flame className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {thread.is_pinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                            <Pin className="w-3 h-3" />
                            Pinned
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          <Flame className="w-3 h-3" />
                          Hot
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{ backgroundColor: `${thread.category.color}20`, color: thread.category.color }}
                        >
                          {thread.category.name}
                        </span>
                      </div>

                      <Link
                        href={`/thread/${thread.slug}`}
                        className="block text-white font-medium group-hover:text-purple-400 transition-colors line-clamp-1"
                      >
                        {thread.title}
                      </Link>

                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>by {thread.author.display_name || thread.author.username}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(thread.updated_at)}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6 shrink-0 text-center">
                      <div>
                        <div className="text-sm font-medium text-white">{formatNumber(thread.post_count - 1)}</div>
                        <div className="text-xs text-slate-500">replies</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{formatNumber(thread.view_count)}</div>
                        <div className="text-xs text-slate-500">views</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/30">
                <Flame className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">No Hot Threads Yet</h3>
                <p className="text-slate-500">Threads will appear here when they get popular!</p>
              </div>
            )}

            {/* Algorithm explanation */}
            <div className="mt-8 p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl">
              <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                How Hot Threads Work
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Threads are marked as "hot" when they receive significant engagement. Create engaging content to see your threads featured here!
              </p>
            </div>
          </div>

          {/* Sidebar - Latest Activity */}
          <div className="lg:w-80 space-y-6">
            {/* Latest Section */}
            {latestThreads.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Latest Activity
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Most recent threads across all categories
                </p>
                <div className="space-y-2">
                  {latestThreads.map((thread) => (
                    <Link
                      key={thread.id}
                      href={`/thread/${thread.slug}`}
                      className="block p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-green-500/30 hover:bg-slate-800/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm text-white group-hover:text-green-400 transition-colors truncate">
                            {thread.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span style={{ color: thread.category.color }}>{thread.category.name}</span>
                            <span>{formatTimeAgo(thread.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Explore</h3>
              <div className="space-y-2">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  Latest Discussions
                </Link>
                <Link
                  href="/categories"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Browse Categories
                </Link>
                <Link
                  href="/members"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Top Members
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
