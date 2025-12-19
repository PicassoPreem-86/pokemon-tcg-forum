'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Loader2,
  ArrowLeft,
  MessageSquare,
  Eye,
  Clock,
  Pin,
  Flame,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Thread, Category, Profile } from '@/lib/supabase/database.types';

interface LikedThread {
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

export default function LikesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();
  const [likedThreads, setLikedThreads] = useState<LikedThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Fetch user's liked threads
  useEffect(() => {
    async function fetchLikedThreads() {
      if (!user) return;

      try {
        const supabase = getSupabaseClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('thread_likes')
          .select(`
            *,
            thread:threads(
              *,
              category:categories(*),
              author:profiles(*)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }) as { data: LikedThread[] | null; error: Error | null };

        if (error) {
          console.error('Error fetching liked threads:', error);
          setLikedThreads([]);
        } else {
          // Filter out any likes where the thread was deleted
          const validLikes = (data || []).filter(like => like.thread !== null);
          setLikedThreads(validLikes);
        }
      } catch (error) {
        console.error('Error fetching liked threads:', error);
        setLikedThreads([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isHydrated && user) {
      fetchLikedThreads();
    }
  }, [isHydrated, user]);

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
            <Heart className="inline-block mr-2" size={28} />
            Liked Threads
          </h1>
          <p>Threads you&apos;ve shown love to</p>
        </div>

        {/* Liked Threads List */}
        {isLoading ? (
          <div className="settings-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading your liked threads...</p>
          </div>
        ) : likedThreads.length === 0 ? (
          <div className="empty-state">
            <Heart size={64} className="empty-state-icon" />
            <h3>No liked threads yet</h3>
            <p>Show appreciation for great discussions by liking threads you enjoy.</p>
            <Link href="/" className="btn btn-primary mt-4">
              Browse Threads
            </Link>
          </div>
        ) : (
          <div className="my-threads-list">
            {likedThreads.map((like) => (
              <div key={like.id} className="my-thread-item">
                <div className="my-thread-content">
                  <div className="my-thread-badges">
                    {like.thread.is_pinned && (
                      <span className="badge badge-pinned">
                        <Pin size={12} /> Pinned
                      </span>
                    )}
                    {like.thread.is_hot && (
                      <span className="badge badge-hot">
                        <Flame size={12} /> Hot
                      </span>
                    )}
                    <span
                      className="thread-tag"
                      style={{ backgroundColor: like.thread.category?.color || '#6366F1', color: 'white' }}
                    >
                      {like.thread.category?.name || 'General'}
                    </span>
                  </div>
                  <Link href={`/thread/${like.thread.slug}`} className="my-thread-title">
                    {like.thread.title}
                  </Link>
                  <p className="my-thread-excerpt">{like.thread.excerpt}</p>
                  <div className="my-thread-meta">
                    <span>
                      by <Link href={`/u/${like.thread.author?.username}`}>{like.thread.author?.display_name || like.thread.author?.username}</Link>
                    </span>
                    <span>
                      <Clock size={14} />
                      {formatTimeAgo(like.thread.created_at)}
                    </span>
                    <span>
                      <MessageSquare size={14} />
                      {like.thread.post_count} replies
                    </span>
                    <span>
                      <Eye size={14} />
                      {like.thread.view_count} views
                    </span>
                  </div>
                  <div className="my-thread-liked-at">
                    <Heart size={12} className="text-red-500 fill-red-500" />
                    Liked {formatTimeAgo(like.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
