import React from 'react';
import Link from 'next/link';
import {
  Hash,
  MessageSquare,
  Eye,
  Clock,
  Flame,
  Pin,
  Tag,
  TrendingUp,
  Users,
  PenSquare,
} from 'lucide-react';
import { getThreadsByTag, getPopularTags } from '@/lib/db/queries';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import TagPageClient from '@/components/tag/TagPageClient';

interface PageProps {
  params: Promise<{ tag: string }>;
}

export default async function TagPage({ params }: PageProps) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag).toLowerCase();

  const threads = await getThreadsByTag(tag, 50);
  const popularTags = await getPopularTags(20);
  const relatedTags = popularTags.filter((t) => t.tag !== tag);

  // Stats
  const totalViews = threads.reduce((acc, t) => acc + (t.view_count || 0), 0);
  const totalReplies = threads.reduce((acc, t) => acc + (t.post_count || 0), 0);

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
                      {threads.length} threads
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
              </div>
            </div>

            {/* Client-side sorting */}
            <TagPageClient tag={tag} initialThreads={threads} />
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
                {relatedTags.slice(0, 10).map(({ tag: t, count }) => (
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
                All Tags ({popularTags.length})
              </h3>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {popularTags.map(({ tag: t }) => (
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
