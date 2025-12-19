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
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Thread, Category, Profile } from '@/lib/supabase/database.types';

interface BookmarkedThread {
  id: string;
  thread_id: string;
  created_at: string;
  thread: Thread & {
    category: Category;
    author: Profile;
  };
}

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
  const [bookmarks, setBookmarks] = useState<BookmarkedThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        const supabase = getSupabaseClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('bookmarks')
          .select(`
            *,
            thread:threads(
              *,
              category:categories(*),
              author:profiles(*)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }) as { data: BookmarkedThread[] | null; error: Error | null };

        if (error) {
          console.error('Error fetching bookmarks:', error);
          // If bookmarks table doesn't exist yet, just show empty state
          setBookmarks([]);
        } else {
          setBookmarks(data || []);
        }
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        setBookmarks([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isHydrated && user) {
      fetchBookmarks();
    }
  }, [isHydrated, user]);

  const removeBookmark = async (bookmarkId: string) => {
    try {
      const supabase = getSupabaseClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);

      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
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
                    onClick={() => removeBookmark(bookmark.id)}
                    className="btn btn-ghost btn-sm text-red-500"
                    title="Remove bookmark"
                  >
                    <Trash2 size={16} />
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
