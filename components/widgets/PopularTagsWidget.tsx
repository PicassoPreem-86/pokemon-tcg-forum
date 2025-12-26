'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Hash, TrendingUp } from 'lucide-react';
import { getPopularTags } from '@/lib/mock-data/threads';

interface PopularTagsWidgetProps {
  limit?: number;
  title?: string;
  showCounts?: boolean;
  className?: string;
}

export default function PopularTagsWidget({
  limit = 15,
  title = 'Popular Tags',
  showCounts = true,
  className = '',
}: PopularTagsWidgetProps) {
  const popularTags = useMemo(() => getPopularTags(limit), [limit]);

  if (popularTags.length === 0) {
    return null;
  }

  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-purple-400" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {popularTags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/tag/${tag}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 hover:bg-purple-600/20 text-slate-300 hover:text-purple-400 rounded-lg text-sm transition-colors group"
          >
            <Hash className="h-3 w-3 text-slate-500 group-hover:text-purple-400" />
            {tag}
            {showCounts && (
              <span className="text-slate-500 text-xs">({count})</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function CompactTagsWidget({
  limit = 10,
  className = '',
}: {
  limit?: number;
  className?: string;
}) {
  const popularTags = useMemo(() => getPopularTags(limit), [limit]);

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {popularTags.map(({ tag }) => (
        <Link
          key={tag}
          href={`/tag/${tag}`}
          className="text-xs px-2 py-1 bg-slate-700/50 hover:bg-purple-600/20 text-slate-400 hover:text-purple-400 rounded transition-colors"
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}
