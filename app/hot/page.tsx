'use client';

import { useMemo, useState } from 'react';
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
  ChevronUp,
  BarChart3,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { formatNumber } from '@/lib/categories';
import {
  getTrendingThreads,
  getRisingThreads,
  getHeatLevel,
  getTrendingStats,
  TrendingThread,
} from '@/lib/mock-data/threads';
import { getCategoryBySlug } from '@/lib/categories';

// Heat level badge component
function HeatBadge({ level }: { level: 'fire' | 'hot' | 'warm' | 'normal' }) {
  const config = {
    fire: {
      bg: 'bg-gradient-to-r from-orange-500 to-red-500',
      text: 'text-white',
      icon: <Flame className="w-3 h-3" />,
      label: 'On Fire',
    },
    hot: {
      bg: 'bg-gradient-to-r from-orange-400 to-orange-500',
      text: 'text-white',
      icon: <Flame className="w-3 h-3" />,
      label: 'Hot',
    },
    warm: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      icon: <TrendingUp className="w-3 h-3" />,
      label: 'Warming Up',
    },
    normal: {
      bg: 'bg-slate-700/50',
      text: 'text-slate-400',
      icon: null,
      label: '',
    },
  };

  const c = config[level];
  if (level === 'normal') return null;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

// Trending score display
function TrendingScore({ score, rank }: { score: number; rank: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-w-[60px] px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <span className="text-xs text-slate-500 uppercase">Rank</span>
      <span className="text-lg font-bold text-purple-400">#{rank}</span>
      <span className="text-xs text-slate-500">{score.toFixed(1)} pts</span>
    </div>
  );
}

// Velocity indicator
function VelocityIndicator({ viewVelocity, replyVelocity }: { viewVelocity: number; replyVelocity: number }) {
  return (
    <div className="hidden lg:flex items-center gap-4 text-xs text-slate-500">
      <span className="flex items-center gap-1" title="Views per hour">
        <Eye className="w-3 h-3" />
        {viewVelocity.toFixed(1)}/hr
      </span>
      <span className="flex items-center gap-1" title="Replies per hour">
        <MessageSquare className="w-3 h-3" />
        {replyVelocity.toFixed(2)}/hr
      </span>
    </div>
  );
}

// Thread card for trending page
function TrendingThreadCard({ thread }: { thread: TrendingThread }) {
  const category = getCategoryBySlug(thread.categoryId);
  const heatLevel = getHeatLevel(thread.trendingScore);

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-all group">
      {/* Rank & Score */}
      <TrendingScore score={thread.trendingScore} rank={thread.trendingRank} />

      {/* Avatar */}
      <div className="relative shrink-0">
        <Image
          src={thread.author.avatar || '/images/avatars/default.png'}
          alt={thread.author.username}
          width={48}
          height={48}
          className="rounded-full"
        />
        {heatLevel === 'fire' && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Flame className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {thread.isPinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
              <Pin className="w-3 h-3" />
              Pinned
            </span>
          )}
          <HeatBadge level={heatLevel} />
          {category && (
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.name}
            </span>
          )}
        </div>

        <Link
          href={`/thread/${thread.slug}`}
          className="block text-white font-medium group-hover:text-purple-400 transition-colors line-clamp-1"
        >
          {thread.title}
        </Link>

        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
          <span>by {thread.author.username}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {thread.hoursOld < 24
              ? `${thread.hoursOld}h ago`
              : `${Math.floor(thread.hoursOld / 24)}d ago`}
          </span>
          <VelocityIndicator viewVelocity={thread.viewVelocity} replyVelocity={thread.replyVelocity} />
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6 shrink-0 text-center">
        <div>
          <div className="text-sm font-medium text-white">{formatNumber(thread.postCount)}</div>
          <div className="text-xs text-slate-500">replies</div>
        </div>
        <div>
          <div className="text-sm font-medium text-white">{formatNumber(thread.viewCount)}</div>
          <div className="text-xs text-slate-500">views</div>
        </div>
        <div>
          <div className="text-sm font-medium text-green-400">{thread.engagementRate.toFixed(1)}%</div>
          <div className="text-xs text-slate-500">engage</div>
        </div>
      </div>
    </div>
  );
}

// Rising thread card (compact)
function RisingThreadCard({ thread }: { thread: TrendingThread }) {
  const category = getCategoryBySlug(thread.categoryId);

  return (
    <Link
      href={`/thread/${thread.slug}`}
      className="block p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-green-500/30 hover:bg-slate-800/50 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 shrink-0">
          <ChevronUp className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm text-white group-hover:text-green-400 transition-colors truncate">
            {thread.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {category && <span style={{ color: category.color }}>{category.name}</span>}
            <span>+{thread.replyVelocity.toFixed(2)} replies/hr</span>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-green-400 transition-colors shrink-0" />
      </div>
    </Link>
  );
}

export default function HotPage() {
  const [showStats, setShowStats] = useState(false);

  // Get trending data
  const trendingThreads = useMemo(() => getTrendingThreads(20), []);
  const risingThreads = useMemo(() => getRisingThreads(5), []);
  const stats = useMemo(() => getTrendingStats(), []);

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
                The hottest discussions based on views, replies, and engagement velocity
              </p>
            </div>

            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:border-purple-500/50 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
          </div>

          {/* Stats Panel */}
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.fireCount}</div>
                <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3" /> On Fire
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.hotCount}</div>
                <div className="text-xs text-slate-500">Hot Threads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.averageScore}</div>
                <div className="text-xs text-slate-500">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalTracked}</div>
                <div className="text-xs text-slate-500">Total Tracked</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Trending List */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Top Trending</h2>
              <span className="text-sm text-slate-500">({trendingThreads.length} threads)</span>
            </div>

            <div className="space-y-3">
              {trendingThreads.map((thread) => (
                <TrendingThreadCard key={thread.id} thread={thread} />
              ))}
            </div>

            {/* Algorithm explanation */}
            <div className="mt-8 p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl">
              <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                How Trending Works
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our algorithm calculates trending scores based on: <strong className="text-slate-400">view velocity</strong> (40%), <strong className="text-slate-400">reply velocity</strong> (35%), <strong className="text-slate-400">engagement rate</strong> (15%), and <strong className="text-slate-400">recency</strong> (10%).
                Threads with recent activity bursts get additional boosts. Scores decay over time to keep the feed fresh.
              </p>
            </div>
          </div>

          {/* Sidebar - Rising Threads */}
          <div className="lg:w-80 space-y-6">
            {/* Rising Section */}
            {risingThreads.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Rising
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Threads gaining momentum - could become hot soon
                </p>
                <div className="space-y-2">
                  {risingThreads.map((thread) => (
                    <RisingThreadCard key={thread.id} thread={thread} />
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Heat Levels</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HeatBadge level="fire" />
                  <span className="text-xs text-slate-500">Score 50+</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeatBadge level="hot" />
                  <span className="text-xs text-slate-500">Score 25-49</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeatBadge level="warm" />
                  <span className="text-xs text-slate-500">Score 10-24</span>
                </div>
              </div>
            </div>

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
                  <BarChart3 className="w-4 h-4" />
                  Browse Categories
                </Link>
                <Link
                  href="/members"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Leaderboards
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
