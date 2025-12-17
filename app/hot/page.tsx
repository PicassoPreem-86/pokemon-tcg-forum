

import Link from 'next/link';
import Image from 'next/image';
import { Flame, Pin } from 'lucide-react';
import { LATEST_THREADS, formatNumber } from '@/lib/categories';

export default function HotPage() {
  // Filter and sort threads by activity (hot threads first)
  const hotThreads = [...LATEST_THREADS]
    .filter(t => t.isHot || t.viewCount > 500)
    .sort((a, b) => b.viewCount - a.viewCount);

  return (
    <div className="content-container">
      <div className="section-header">
        <h1 className="section-title">
          <Flame className="w-6 h-6 text-orange-500" />
          Hot Topics
        </h1>
      </div>

      <p className="text-[var(--color-text-muted)] mb-6">
        The most active and popular discussions in the community right now.
      </p>

      <div className="thread-list">
        {hotThreads.map((thread) => (
          <div key={thread.id} className="thread-item">
            <div className="thread-avatar">
              <Image
                src={thread.authorAvatar}
                alt={thread.author}
                width={44}
                height={44}
              />
            </div>
            <div className="thread-content">
              <div className="thread-title-row">
                {thread.isPinned && (
                  <span className="badge badge-pinned">
                    <Pin className="w-3 h-3 inline" /> Pinned
                  </span>
                )}
                {thread.isHot && (
                  <span className="badge badge-hot">
                    <Flame className="w-3 h-3 inline" /> Hot
                  </span>
                )}
                <span
                  className="thread-tag"
                  style={{ backgroundColor: thread.categoryColor, color: 'white' }}
                >
                  {thread.category}
                </span>
              </div>
              <Link href={`/t/${thread.id}`} className="thread-title">
                {thread.title}
              </Link>
              <div className="thread-meta">
                by <Link href={`/u/${thread.author}`}>{thread.author}</Link> · {thread.lastActivity}
              </div>
            </div>
            <div className="thread-stats">
              <div className="thread-stat">
                <span className="thread-stat-value">{thread.replyCount}</span>
                <span className="thread-stat-label">Replies</span>
              </div>
              <div className="thread-stat">
                <span className="thread-stat-value">{formatNumber(thread.viewCount)}</span>
                <span className="thread-stat-label">Views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
