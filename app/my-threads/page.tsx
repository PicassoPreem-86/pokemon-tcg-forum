'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Loader2,
  ArrowLeft,
  MessageSquare,
  Eye,
  Clock,
  Pin,
  Flame,
  Plus,
  Edit,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Thread, Category } from '@/lib/supabase/database.types';

interface ThreadWithCategory extends Thread {
  category: Category;
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

export default function MyThreadsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();
  const [threads, setThreads] = useState<ThreadWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Fetch user's threads
  useEffect(() => {
    async function fetchThreads() {
      if (!user) return;

      try {
        const supabase = getSupabaseClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('threads')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('author_id', user.id)
          .order('created_at', { ascending: false }) as { data: ThreadWithCategory[] | null; error: Error | null };

        if (error) {
          console.error('Error fetching threads:', error);
        } else {
          setThreads(data || []);
        }
      } catch (error) {
        console.error('Error fetching threads:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isHydrated && user) {
      fetchThreads();
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
            <FileText className="inline-block mr-2" size={28} />
            My Threads
          </h1>
          <p>All the discussions you&apos;ve started</p>
        </div>

        {/* Actions */}
        <div className="my-threads-actions">
          <Link href="/new" className="btn btn-primary">
            <Plus size={18} />
            Create New Thread
          </Link>
        </div>

        {/* Threads List */}
        {isLoading ? (
          <div className="settings-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading your threads...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} className="empty-state-icon" />
            <h3>No threads yet</h3>
            <p>You haven&apos;t created any threads yet. Start a new discussion!</p>
            <Link href="/new" className="btn btn-primary mt-4">
              <Plus size={18} />
              Create Your First Thread
            </Link>
          </div>
        ) : (
          <div className="my-threads-list">
            {threads.map((thread) => (
              <div key={thread.id} className="my-thread-item">
                <div className="my-thread-content">
                  <div className="my-thread-badges">
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
                      <span className="badge badge-locked">Locked</span>
                    )}
                    <span
                      className="thread-tag"
                      style={{ backgroundColor: thread.category?.color || '#6366F1', color: 'white' }}
                    >
                      {thread.category?.name || 'General'}
                    </span>
                  </div>
                  <Link href={`/thread/${thread.slug}`} className="my-thread-title">
                    {thread.title}
                  </Link>
                  <p className="my-thread-excerpt">{thread.excerpt}</p>
                  <div className="my-thread-meta">
                    <span>
                      <Clock size={14} />
                      {formatTimeAgo(thread.created_at)}
                    </span>
                    <span>
                      <MessageSquare size={14} />
                      {thread.post_count} {thread.post_count === 1 ? 'reply' : 'replies'}
                    </span>
                    <span>
                      <Eye size={14} />
                      {thread.view_count} views
                    </span>
                  </div>
                </div>
                <div className="my-thread-actions">
                  <Link href={`/thread/${thread.slug}/edit`} className="btn btn-ghost btn-sm">
                    <Edit size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
