'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Trash2,
  Settings,
  Clock,
  MessageSquare,
  Filter,
  CheckCheck,
  AlertCircle,
} from 'lucide-react';
import { useSubscriptionStore, ThreadSubscription } from '@/lib/subscription-store';
import { useUnreadStore } from '@/lib/unread-store';
import { useAuthStore } from '@/lib/auth-store';
import { getCategoryBySlug } from '@/lib/categories';
import UnreadIndicator from '@/components/forum/UnreadIndicator';

// Format relative time
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
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Subscription card component
function SubscriptionCard({
  subscription,
  onUnsubscribe,
  onUpdateSettings,
}: {
  subscription: ThreadSubscription;
  onUnsubscribe: (threadId: string) => void;
  onUpdateSettings: (threadId: string, settings: { notifyOnReply?: boolean; notifyOnMention?: boolean }) => void;
}) {
  const [showSettings, setShowSettings] = useState(false);
  const category = getCategoryBySlug(subscription.categoryId);

  // Get post count from mock data (in real app, this would come from the subscription or be fetched)
  const mockPostCount = 10; // Placeholder - would need to be fetched

  return (
    <div className="group relative flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
      {/* Subscription icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
        <Eye className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {/* Category badge */}
          {category && (
            <span
              className="px-2 py-0.5 text-xs rounded"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.name}
            </span>
          )}

          {/* Auto-subscribed badge */}
          {subscription.isAutoSubscribed && (
            <span className="px-2 py-0.5 text-xs rounded bg-slate-700 text-slate-400">
              Auto
            </span>
          )}

          {/* Unread indicator */}
          <UnreadIndicator
            threadId={subscription.threadId}
            currentPostCount={mockPostCount}
            variant="badge"
            size="sm"
          />
        </div>

        {/* Thread title */}
        <Link
          href={`/thread/${subscription.threadSlug}`}
          className="block text-white font-medium hover:text-purple-400 transition-colors line-clamp-1 mb-1"
        >
          {subscription.threadTitle}
        </Link>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Subscribed {formatTimeAgo(subscription.subscribedAt)}
          </span>
          <span className="flex items-center gap-1">
            {subscription.notifyOnReply ? (
              <Bell className="w-3 h-3 text-purple-400" />
            ) : (
              <BellOff className="w-3 h-3" />
            )}
            {subscription.notifyOnReply ? 'Notifications on' : 'Notifications off'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Settings dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Notification settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {showSettings && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSettings(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-2">
                <div className="px-3 py-2 border-b border-slate-700">
                  <h4 className="text-sm font-medium text-white">Notifications</h4>
                </div>

                <div className="py-1">
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subscription.notifyOnReply}
                      onChange={(e) => {
                        onUpdateSettings(subscription.threadId, { notifyOnReply: e.target.checked });
                      }}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-300">New replies</span>
                  </label>

                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subscription.notifyOnMention}
                      onChange={(e) => {
                        onUpdateSettings(subscription.threadId, { notifyOnMention: e.target.checked });
                      }}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-300">Mentions</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Unsubscribe button */}
        <button
          onClick={() => onUnsubscribe(subscription.threadId)}
          className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          title="Unsubscribe"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function WatchingPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'auto'>('all');
  const [showUnsubscribeAll, setShowUnsubscribeAll] = useState(false);

  const { user } = useAuthStore();
  const subscriptions = useSubscriptionStore(state => state.getAllSubscriptions());
  const unsubscribe = useSubscriptionStore(state => state.unsubscribe);
  const unsubscribeAll = useSubscriptionStore(state => state.unsubscribeAll);
  const updateSettings = useSubscriptionStore(state => state.updateSubscriptionSettings);
  const isThreadUnread = useUnreadStore(state => state.isThreadUnread);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    if (!isHydrated) return [];

    return subscriptions.filter(sub => {
      if (filter === 'auto') return sub.isAutoSubscribed;
      if (filter === 'unread') return isThreadUnread(sub.threadId, 10); // Mock post count
      return true;
    });
  }, [subscriptions, filter, isHydrated, isThreadUnread]);

  // Stats
  const stats = useMemo(() => {
    if (!isHydrated) return { total: 0, auto: 0, manual: 0 };

    return {
      total: subscriptions.length,
      auto: subscriptions.filter(s => s.isAutoSubscribed).length,
      manual: subscriptions.filter(s => !s.isAutoSubscribed).length,
    };
  }, [subscriptions, isHydrated]);

  // Loading state
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/10 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-slate-800 rounded" />
            <div className="h-4 w-64 bg-slate-800 rounded" />
            <div className="space-y-3 mt-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-slate-800/50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/10 to-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Eye className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Watch Threads</h1>
            <p className="text-slate-400 mb-6">
              Log in to subscribe to threads and get notified of new replies.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/10 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Eye className="h-6 w-6 text-purple-400" />
                </div>
                Watching
              </h1>
              <p className="text-slate-400 mt-2">
                Threads you're subscribed to for updates
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
              <div className="text-center px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-xl font-bold text-purple-400">{stats.manual}</div>
                <div className="text-xs text-slate-500">Manual</div>
              </div>
              <div className="text-center px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-xl font-bold text-slate-400">{stats.auto}</div>
                <div className="text-xs text-slate-500">Auto</div>
              </div>
            </div>
          </div>

          {/* Filters and actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Filter tabs */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <div className="flex bg-slate-800/50 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filter === 'all'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filter === 'unread'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter('auto')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filter === 'auto'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Auto-subscribed
                </button>
              </div>
            </div>

            {/* Bulk actions */}
            {stats.total > 0 && (
              <button
                onClick={() => setShowUnsubscribeAll(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Unsubscribe All
              </button>
            )}
          </div>
        </div>

        {/* Unsubscribe all confirmation */}
        {showUnsubscribeAll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-500/20">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Unsubscribe from all?</h3>
              </div>
              <p className="text-slate-400 mb-6">
                This will remove all {stats.total} thread subscriptions. This action cannot be undone.
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setShowUnsubscribeAll(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    unsubscribeAll();
                    setShowUnsubscribeAll(false);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                >
                  Unsubscribe All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions list */}
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <EyeOff className="w-8 h-8 text-slate-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {filter === 'all' ? 'No subscriptions yet' : `No ${filter} subscriptions`}
            </h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              {filter === 'all'
                ? 'Subscribe to threads to get notified of new replies. Click the "Watch" button on any thread.'
                : filter === 'unread'
                ? 'You have no subscribed threads with unread posts.'
                : 'You have no auto-subscribed threads. Reply to a thread to auto-subscribe.'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                View all subscriptions
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSubscriptions.map(subscription => (
              <SubscriptionCard
                key={subscription.threadId}
                subscription={subscription}
                onUnsubscribe={unsubscribe}
                onUpdateSettings={updateSettings}
              />
            ))}
          </div>
        )}

        {/* Help text */}
        {stats.total > 0 && (
          <div className="mt-8 p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl">
            <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              How Watching Works
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-400">Manual subscriptions:</strong> Click the Watch button on any thread to subscribe.{' '}
              <strong className="text-slate-400">Auto-subscriptions:</strong> When you reply to a thread, you're automatically subscribed.
              You'll receive notifications based on your settings for each thread.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
