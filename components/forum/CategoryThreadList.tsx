'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Eye, Pin, Flame } from 'lucide-react';
import { useThreadStore } from '@/lib/thread-store';
import { Thread } from '@/lib/types';

interface CategoryThreadListProps {
  categoryId: string;
  mockThreads: Thread[];
  sortBy: 'latest' | 'hot' | 'top';
  currentPage: number;
  threadsPerPage?: number;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toString();
}

export default function CategoryThreadList({
  categoryId,
  mockThreads,
  sortBy,
  currentPage,
  threadsPerPage = 20
}: CategoryThreadListProps) {
  const { userThreads } = useThreadStore();

  // Combine user threads with mock threads
  const allThreads = useMemo(() => {
    // Filter user threads by category
    const categoryUserThreads = userThreads.filter(t => t.categoryId === categoryId);

    // Combine with mock threads
    const combined = [...categoryUserThreads, ...mockThreads];

    // Sort based on sortBy
    let sorted = [...combined];
    switch (sortBy) {
      case 'latest':
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'hot':
        sorted.sort((a, b) => {
          const scoreA = (a.isHot ? 1000 : 0) + a.postCount + (a.viewCount / 10);
          const scoreB = (b.isHot ? 1000 : 0) + b.postCount + (b.viewCount / 10);
          return scoreB - scoreA;
        });
        break;
      case 'top':
        sorted.sort((a, b) => b.viewCount - a.viewCount);
        break;
    }

    return sorted;
  }, [userThreads, mockThreads, categoryId, sortBy]);

  // Separate pinned and regular threads
  const pinnedThreads = allThreads.filter(t => t.isPinned);
  const regularThreads = allThreads.filter(t => !t.isPinned);

  // Pagination
  const totalPages = Math.ceil(regularThreads.length / threadsPerPage);
  const startIndex = (currentPage - 1) * threadsPerPage;
  const endIndex = startIndex + threadsPerPage;
  const paginatedThreads = regularThreads.slice(startIndex, endIndex);

  // Show pinned threads only on page 1
  const displayThreads = currentPage === 1
    ? [...pinnedThreads, ...paginatedThreads]
    : paginatedThreads;

  if (displayThreads.length === 0) {
    return (
      <div className="empty-state">
        <MessageCircle size={48} />
        <h3>No threads yet</h3>
        <p>Be the first to start a discussion in this category!</p>
        <Link href="/new" className="btn btn-primary">
          Start New Thread
        </Link>
      </div>
    );
  }

  return (
    <>
      {displayThreads.map((thread, index) => {
        // Show divider after pinned threads
        const showDivider = currentPage === 1 &&
                           index === pinnedThreads.length &&
                           pinnedThreads.length > 0;

        return (
          <div key={thread.id}>
            {showDivider && <div className="thread-list-divider" />}

            <div className="thread-item">
              <div className="thread-avatar">
                {thread.author.avatar && (
                  <Image
                    src={thread.author.avatar}
                    alt={thread.author.username}
                    width={44}
                    height={44}
                  />
                )}
              </div>

              <div className="thread-content">
                <div className="thread-title-row">
                  {thread.isPinned && (
                    <span className="thread-tag badge-pinned">
                      <Pin size={12} />
                      Pinned
                    </span>
                  )}
                  {thread.isHot && (
                    <span className="thread-tag badge-hot">
                      <Flame size={12} />
                      Hot
                    </span>
                  )}
                  <Link href={`/thread/${thread.slug}`} className="thread-title">
                    {thread.title}
                  </Link>
                </div>

                <div className="thread-meta">
                  By <Link href={`/user/${thread.author.username}`}>{thread.author.username}</Link>
                  {' '}&bull;{' '}
                  {formatTimeAgo(thread.updatedAt)}
                  {thread.lastReply && (
                    <>
                      {' '}&bull;{' '}
                      Last reply by <Link href={`/user/${thread.lastReply.username}`}>{thread.lastReply.username}</Link>
                    </>
                  )}
                </div>
              </div>

              <div className="thread-stats">
                <div className="thread-stat">
                  <div className="thread-stat-value">
                    <MessageCircle size={14} />
                    {formatCount(thread.postCount)}
                  </div>
                  <div className="thread-stat-label">Replies</div>
                </div>
                <div className="thread-stat">
                  <div className="thread-stat-value">
                    <Eye size={14} />
                    {formatCount(thread.viewCount)}
                  </div>
                  <div className="thread-stat-label">Views</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
