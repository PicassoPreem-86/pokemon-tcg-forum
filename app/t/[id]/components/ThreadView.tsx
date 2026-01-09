'use client';

import React from 'react';
import Link from 'next/link';
import {
  Eye,
  MessageSquare,
  Clock,
  Pin,
  Flame,
  Lock
} from 'lucide-react';
import { formatNumber } from '@/lib/categories';
import PostCard from './PostCard';
import ReplyForm from './ReplyForm';
import QuickNav from './QuickNav';
import ForumLayout from '@/components/layout/ForumLayout';
import type { ThreadDetail } from '@/lib/db/thread-queries';

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format relative time for last activity
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

interface ThreadViewProps {
  thread: ThreadDetail;
  relatedThreads: any[];
}

export default function ThreadView({ thread, relatedThreads }: ThreadViewProps) {
  // Convert thread author to post format for the first post
  const originalPost = {
    id: thread.id,
    thread_id: thread.id,
    author_id: thread.author_id,
    content: thread.content,
    like_count: 0, // Thread likes would need separate query
    is_edited: false,
    created_at: thread.created_at,
    updated_at: thread.updated_at,
    author: thread.author,
    parent_reply_id: null,
    images: []
  };

  return (
    <ForumLayout>
      <div className="content-container">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href={`/c/${thread.category.slug}`}>{thread.category.name}</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">
            {thread.title.length > 40 ? `${thread.title.slice(0, 40)}...` : thread.title}
          </span>
        </nav>

        {/* Thread Header */}
        <header className="thread-header">
          <div className="thread-header-top">
            <div className="thread-badges">
              {thread.is_pinned && (
                <span className="badge badge-pinned">
                  <Pin size={12} /> Pinned
                </span>
              )}
              {thread.is_hot && (
                <span className="badge badge-hot">
                  <Flame size={12} /> Hot
                </span>
              )}
              {thread.is_locked && (
                <span className="badge badge-locked">
                  <Lock size={12} /> Locked
                </span>
              )}
              <span
                className="badge badge-category"
                style={{ backgroundColor: thread.category.color }}
              >
                {thread.category.name}
              </span>
            </div>
          </div>

          <h1 className="thread-title">{thread.title}</h1>

          <div className="thread-meta">
            <div className="thread-meta-item">
              <Eye size={16} />
              <span>{formatNumber(thread.view_count)} views</span>
            </div>
            <div className="thread-meta-item">
              <MessageSquare size={16} />
              <span>{thread.post_count - 1} replies</span>
            </div>
            <div className="thread-meta-item">
              <Clock size={16} />
              <span>Last activity {getRelativeTime(thread.updated_at)}</span>
            </div>
          </div>

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="thread-tags">
              {thread.tags.map((tag) => (
                <Link key={tag} href={`/tag/${tag}`} className="thread-tag">
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Posts */}
        <div className="posts-container">
          {/* Original Post */}
          <PostCard
            post={originalPost}
            isFirst={true}
            threadId={thread.id}
          />

          {/* Replies */}
          {thread.replies.map((reply) => (
            <PostCard
              key={reply.id}
              post={reply}
              isFirst={false}
              threadId={thread.id}
            />
          ))}
        </div>

        {/* Pagination - TODO: Implement proper pagination */}
        {thread.post_count > thread.replies.length + 1 && (
          <div className="posts-pagination">
            <p className="text-gray-400 text-sm text-center py-4">
              Showing {thread.replies.length + 1} of {thread.post_count} posts.
              Pagination coming soon!
            </p>
          </div>
        )}

        {/* Reply Form */}
        {!thread.is_locked && <ReplyForm threadId={thread.id} />}

        {/* Thread Locked Message */}
        {thread.is_locked && (
          <div className="thread-locked-message">
            <Lock size={20} />
            <p>This thread has been locked. No new replies can be posted.</p>
          </div>
        )}

        {/* Related Threads Sidebar */}
        {relatedThreads.length > 0 && (
          <aside className="related-threads">
            <h3 className="related-threads-title">Related Discussions</h3>
            <div className="related-threads-list">
              {relatedThreads.map((related: any) => (
                <Link
                  key={related.id}
                  href={`/t/${related.slug}`}
                  className="related-thread-item"
                >
                  <div className="related-thread-title">{related.title}</div>
                  <div className="related-thread-meta">
                    <span>{formatNumber(related.view_count)} views</span>
                    <span>•</span>
                    <span>{related.post_count - 1} replies</span>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* Quick Navigation */}
        <QuickNav />
      </div>
    </ForumLayout>
  );
}
