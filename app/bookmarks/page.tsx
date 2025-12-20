'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  Loader2,
  ArrowLeft,
  MessageSquare,
  Eye,
  Clock,
  Pin,
  Flame,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { getUserBookmarks, removeBookmark, type BookmarkedThreadData } from '@/lib/actions/bookmarks';
import { showSuccessToast, showErrorToast } from '@/lib/toast-store';

function formatTimeAgo(dateString: string): string {
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

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function BookmarksPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedThreadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingBookmarkId, setRemovingBookmarkId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Fetch user's bookmarks
  useEffect(() => {
    async function fetchBookmarks() {
      if (!user) return;

      try {
        const data = await getUserBookmarks();
        setBookmarks(data);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        showErrorToast('Error loading bookmarks', 'Please try refreshing the page');
        setBookmarks([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isHydrated && user) {
      fetchBookmarks();
    }
  }, [isHydrated, user]);

  const handleRemoveBookmark = async (threadId: string, bookmarkId: string) => {
    setRemovingBookmarkId(bookmarkId);

    try {
      const result = await removeBookmark(threadId);

      if (result.success) {
        setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
        showSuccessToast('Bookmark removed', 'Thread removed from your bookmarks');
      } else {
        showErrorToast('Failed to remove', result.error || 'Could not remove bookmark');
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      showErrorToast('Error', 'An unexpected error occurred');
    } finally {
      setRemovingBookmarkId(null);
    }
  };

  // Show loading while checking auth
  if (!isHydrated) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <Loader2 size={48} className="spin" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <Link href={`/u/${user.username}`} className="settings-back">
            <ArrowLeft size={20} />
            Back to Profile
          </Link>
          <h1>
            <Bookmark className="inline-block mr-2" size={28} />
            Bookmarks
          </h1>
          <p>Threads you&apos;ve saved for later</p>
        </div>

        {/* Bookmarks List */}
        {isLoading ? (
          <div className="settings-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading your bookmarks...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="empty-state">
            <Bookmark size={64} className="empty-state-icon" />
            <h3>No bookmarks yet</h3>
            <p>Save threads to read later by clicking the bookmark icon on any thread.</p>
            <Link href="/" className="btn btn-primary mt-4">
              Browse Threads
            </Link>
          </div>
        ) : (
          <div className="my-threads-list">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="my-thread-item">
                <div className="my-thread-content">
                  <div className="my-thread-badges">
                    {bookmark.thread.is_pinned && (
                      <span className="badge badge-pinned">
                        <Pin size={12} /> Pinned
                      </span>
                    )}
                    {bookmark.thread.is_hot && (
                      <span className="badge badge-hot">
                        <Flame size={12} /> Hot
                      </span>
                    )}
                    <span
                      className="thread-tag"
                      style={{ backgroundColor: bookmark.thread.category?.color || '#6366F1', color: 'white' }}
                    >
                      {bookmark.thread.category?.name || 'General'}
                    </span>
                  </div>
                  <Link href={`/thread/${bookmark.thread.slug}`} className="my-thread-title">
                    {bookmark.thread.title}
                  </Link>
                  <p className="my-thread-excerpt">{bookmark.thread.excerpt}</p>
                  <div className="my-thread-meta">
                    <span>
                      by <Link href={`/u/${bookmark.thread.author?.username}`}>{bookmark.thread.author?.display_name || bookmark.thread.author?.username}</Link>
                    </span>
                    <span>
                      <Clock size={14} />
                      {formatTimeAgo(bookmark.thread.created_at)}
                    </span>
                    <span>
                      <MessageSquare size={14} />
                      {bookmark.thread.post_count} replies
                    </span>
                    <span>
                      <Eye size={14} />
                      {bookmark.thread.view_count} views
                    </span>
                  </div>
                </div>
                <div className="my-thread-actions">
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.thread_id, bookmark.id)}
                    className="btn btn-ghost btn-sm text-red-500"
                    title="Remove bookmark"
                    disabled={removingBookmarkId === bookmark.id}
                  >
                    {removingBookmarkId === bookmark.id ? (
                      <Loader2 size={16} className="spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
