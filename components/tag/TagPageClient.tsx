'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Eye,
  Clock,
  Flame,
  Pin,
  Tag,
  PenSquare,
  ArrowUpDown,
} from 'lucide-react';
import { type Thread } from '@/lib/db/queries';
import { formatNumber, formatRelativeTime } from '@/lib/utils';

type SortOption = 'latest' | 'oldest' | 'most_replies' | 'most_views';

interface TagPageClientProps {
  tag: string;
  initialThreads: Thread[];
}

export default function TagPageClient({ tag, initialThreads }: TagPageClientProps) {
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  // Sort threads
  const sortedThreads = useMemo(() => {
    return [...initialThreads].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_replies':
          return (b.post_count || 0) - (a.post_count || 0);
        case 'most_views':
          return (b.view_count || 0) - (a.view_count || 0);
        default: // latest
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });
  }, [initialThreads, sortBy]);

  return (
    <>
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm">
          {sortedThreads.length} thread{sortedThreads.length !== 1 ? 's' : ''} tagged with #{tag}
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
      {sortedThreads.length > 0 ? (
        <div className="space-y-3">
          {sortedThreads.map((thread) => (
            <Link
              key={thread.id}
              href={`/thread/${thread.slug}`}
              className="block bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/70 hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                <img
                  src={thread.author.avatar_url || '/images/avatars/default.png'}
                  alt={thread.author.username}
                  className="w-12 h-12 rounded-full bg-slate-700 object-cover flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/avatars/default.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {thread.is_pinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </span>
                    )}
                    {thread.is_hot && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                        <Flame className="h-3 w-3" />
                        Hot
                      </span>
                    )}
                    <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors truncate">
                      {thread.title}
                    </h3>
                  </div>
                  {thread.excerpt && (
                    <p className="text-slate-400 text-sm line-clamp-2 mb-2">
                      {thread.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    {thread.category && (
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${thread.category.color}20`,
                          color: thread.category.color,
                        }}
                      >
                        {thread.category.name}
                      </span>
                    )}
                    <span>by {thread.author.display_name || thread.author.username}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(thread.updated_at)}
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
                    {formatNumber(thread.post_count || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {formatNumber(thread.view_count || 0)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
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
            <PenSquare className="h-4 w-4" />
            Create a thread with this tag
          </Link>
        </div>
      )}
    </>
  );
}
