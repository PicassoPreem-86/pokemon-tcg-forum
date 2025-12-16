'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Hash,
  MessageSquare,
  Eye,
  Clock,
  Bell,
  BellOff,
  ChevronDown,
  Flame,
  Pin,
  Tag
} from 'lucide-react';
import { MOCK_THREADS } from '@/lib/mock-data/threads';
import { CATEGORIES } from '@/lib/categories';

type SortOption = 'latest' | 'oldest' | 'most_replies' | 'most_views';

// Mock related tags
const RELATED_TAGS: Record<string, { tag: string; count: number }[]> = {
  charizard: [
    { tag: 'vintage', count: 45 },
    { tag: 'psa10', count: 89 },
    { tag: 'grading', count: 234 },
    { tag: 'base-set', count: 156 }
  ],
  pikachu: [
    { tag: 'illustrator', count: 12 },
    { tag: 'promo', count: 67 },
    { tag: 'japanese', count: 134 },
    { tag: 'vintage', count: 45 }
  ],
  grading: [
    { tag: 'psa', count: 890 },
    { tag: 'cgc', count: 234 },
    { tag: 'bgs', count: 178 },
    { tag: 'centering', count: 123 }
  ],
  default: [
    { tag: 'trading', count: 456 },
    { tag: 'collection', count: 345 },
    { tag: 'rare', count: 234 },
    { tag: 'holo', count: 189 }
  ]
};

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
  const tag = (params.tag as string).toLowerCase();
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [isFollowing, setIsFollowing] = useState(false);

  // Filter threads that have this tag
  const taggedThreads = useMemo(() => {
    const threads = MOCK_THREADS.filter(thread =>
      thread.tags?.some(t => t.toLowerCase() === tag)
    );

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
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [tag, sortBy]);

  // Get related tags
  const relatedTags = RELATED_TAGS[tag] || RELATED_TAGS.default;

  // Stats
  const totalViews = taggedThreads.reduce((acc, t) => acc + t.viewCount, 0);
  const totalReplies = taggedThreads.reduce((acc, t) => acc + t.postCount, 0);

  return (
    <div className="tag-page">
      {/* Header */}
      <div className="tag-header">
        <nav className="tag-breadcrumbs">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Tags</span>
          <span>/</span>
          <span>#{tag}</span>
        </nav>

        <h1 className="tag-title">
          <Hash size={28} />
          #{tag}
        </h1>

        <div className="tag-meta">
          <span className="tag-meta-item">
            <MessageSquare size={16} />
            {taggedThreads.length} threads
          </span>
          <span className="tag-meta-item">
            <Eye size={16} />
            {formatNumber(totalViews)} views
          </span>
          <span className="tag-meta-item">
            <Clock size={16} />
            {totalReplies} replies
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="tag-controls">
        <div className="tag-sort">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="most_replies">Most Replies</option>
            <option value="most_views">Most Views</option>
          </select>
        </div>

        <button
          className={`tag-follow-btn ${isFollowing ? 'following' : ''}`}
          onClick={() => setIsFollowing(!isFollowing)}
        >
          {isFollowing ? (
            <>
              <BellOff size={16} />
              Following
            </>
          ) : (
            <>
              <Bell size={16} />
              Follow Tag
            </>
          )}
        </button>
      </div>

      {/* Thread List */}
      {taggedThreads.length > 0 ? (
        <div className="tag-thread-list">
          {taggedThreads.map(thread => {
            const category = CATEGORIES.find(c => c.id === thread.categoryId);
            return (
              <Link
                key={thread.id}
                href={`/thread/${thread.slug}`}
                className="search-thread-item"
              >
                <div className="search-thread-avatar">
                  <Image
                    src="/images/avatars/default.png"
                    alt={thread.author.username}
                    width={44}
                    height={44}
                  />
                </div>
                <div className="search-thread-content">
                  <div className="search-thread-title-row">
                    {thread.isPinned && (
                      <span className="badge badge-pinned"><Pin size={12} /></span>
                    )}
                    {thread.isHot && (
                      <span className="badge badge-hot"><Flame size={12} /></span>
                    )}
                    <h3 className="search-thread-title">{thread.title}</h3>
                  </div>
                  <p className="search-thread-excerpt">{thread.excerpt}</p>
                  <div className="search-thread-meta">
                    <span className="search-thread-category" style={{ color: category?.color }}>
                      {category?.name}
                    </span>
                    <span>by {thread.author.username}</span>
                    <span>{formatTimeAgo(thread.updatedAt)}</span>
                    {thread.tags?.filter(t => t.toLowerCase() !== tag).slice(0, 2).map(t => (
                      <Link
                        key={t}
                        href={`/tag/${t}`}
                        className="search-thread-tag"
                        onClick={(e) => e.stopPropagation()}
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="search-thread-stats">
                  <div className="search-stat">
                    <MessageSquare size={14} />
                    {formatNumber(thread.postCount)}
                  </div>
                  <div className="search-stat">
                    <Eye size={14} />
                    {formatNumber(thread.viewCount)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="tag-empty">
          <Tag size={64} />
          <h3>No threads found</h3>
          <p>No threads have been tagged with #{tag} yet.</p>
        </div>
      )}

      {/* Related Tags */}
      <div className="related-tags">
        <h3>Related Tags</h3>
        <div className="related-tags-list">
          {relatedTags.map(({ tag: relatedTag, count }) => (
            <Link
              key={relatedTag}
              href={`/tag/${relatedTag}`}
              className="related-tag"
            >
              #{relatedTag}
              <span>({count})</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
