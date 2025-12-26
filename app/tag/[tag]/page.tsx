'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Hash,
  MessageSquare,
  Eye,
  Clock,
  Bell,
  BellOff,
  Flame,
  Pin,
  Tag,
  TrendingUp,
  ArrowUpDown,
  Users,
} from 'lucide-react';
import { getThreadsByTag, getPopularTags, getAllTags } from '@/lib/mock-data/threads';
import { CATEGORIES } from '@/lib/categories';

type SortOption = 'latest' | 'oldest' | 'most_replies' | 'most_views';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays < 1) return 'Today';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export default function TagPage() {
  const params = useParams();
  const tag = decodeURIComponent(params.tag as string).toLowerCase();
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [isFollowing, setIsFollowing] = useState(false);

  // Get threads with this tag
  const taggedThreads = useMemo(() => {
    const threads = getThreadsByTag(tag);

    // Sort threads
    return [...threads].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most_replies':
          return b.postCount - a.postCount;
        case 'most_views':
          return b.viewCount - a.viewCount;
        default: // latest
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [tag, sortBy]);

  // Get related/popular tags (excluding current tag)
  const relatedTags = useMemo(() => {
    return getPopularTags(10).filter((t) => t.tag !== tag);
  }, [tag]);

  // Get all tags for the sidebar
  const allTags = useMemo(() => getAllTags(), []);

  // Stats
  const totalViews = taggedThreads.reduce((acc, t) => acc + t.viewCount, 0);
  const totalReplies = taggedThreads.reduce((acc, t) => acc + t.postCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
              <Link href="/" className="hover:text-purple-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span>Tags</span>
              <span>/</span>
              <span className="text-purple-400">#{tag}</span>
            </nav>

            {/* Tag Header */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20">
                      <Hash className="h-6 w-6 text-purple-400" />
                    </div>
                    #{tag}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {taggedThreads.length} threads
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {formatNumber(totalViews)} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {formatNumber(totalReplies)} replies
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isFollowing
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50'
                      : 'bg-purple-600 text-white hover:bg-purple-500'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <BellOff className="h-4 w-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      Follow Tag
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">
                {taggedThreads.length} thread{taggedThreads.length !== 1 ? 's' : ''} tagged with #{tag}
              </span>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="latest">Latest Activity</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most_replies">Most Replies</option>
                  <option value="most_views">Most Views</option>
                </select>
              </div>
            </div>

            {/* Thread List */}
            {taggedThreads.length > 0 ? (
              <div className="space-y-3">
                {taggedThreads.map((thread) => {
                  const category = CATEGORIES.find((c) => c.id === thread.categoryId);
                  return (
                    <Link
                      key={thread.id}
                      href={`/thread/${thread.slug}`}
                      className="block bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/70 hover:border-purple-500/30 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={thread.author.avatar || '/images/avatars/default.png'}
                          alt={thread.author.username}
                          className="w-12 h-12 rounded-full bg-slate-700 object-cover flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/avatars/default.png';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {thread.isPinned && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                                <Pin className="h-3 w-3" />
                                Pinned
                              </span>
                            )}
                            {thread.isHot && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                                <Flame className="h-3 w-3" />
                                Hot
                              </span>
                            )}
                            <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors truncate">
                              {thread.title}
                            </h3>
                          </div>
                          <p className="text-slate-400 text-sm line-clamp-2 mb-2">
                            {thread.excerpt}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            {category && (
                              <span
                                className="px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${category.color}20`,
                                  color: category.color,
                                }}
                              >
                                {category.name}
                              </span>
                            )}
                            <span>by {thread.author.username}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(thread.updatedAt)}
                            </span>
                            {thread.tags
                              ?.filter((t) => t.toLowerCase() !== tag)
                              .slice(0, 3)
                              .map((t) => (
                                <Link
                                  key={t}
                                  href={`/tag/${t}`}
                                  className="text-purple-400 hover:text-purple-300"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  #{t}
                                </Link>
                              ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-sm text-slate-400 flex-shrink-0">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {formatNumber(thread.postCount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatNumber(thread.viewCount)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
                <Tag className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No threads found</h3>
                <p className="text-slate-400 mb-4">
                  No threads have been tagged with #{tag} yet.
                </p>
                <Link
                  href="/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                  Create a thread with this tag
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Popular Tags */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedTags.map(({ tag: t, count }) => (
                  <Link
                    key={t}
                    href={`/tag/${t}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 hover:bg-purple-600/20 text-slate-300 hover:text-purple-400 rounded-lg text-sm transition-colors"
                  >
                    <Hash className="h-3 w-3" />
                    {t}
                    <span className="text-slate-500 text-xs">({count})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* All Tags */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-purple-400" />
                All Tags ({allTags.length})
              </h3>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {allTags.map((t) => (
                  <Link
                    key={t}
                    href={`/tag/${t}`}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      t === tag
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700/50 text-slate-400 hover:bg-purple-600/20 hover:text-purple-400'
                    }`}
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
