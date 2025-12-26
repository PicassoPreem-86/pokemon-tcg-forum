'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Bell, BellOff, Check } from 'lucide-react';
import { useSubscriptionStore } from '@/lib/subscription-store';
import { useAuthStore } from '@/lib/auth-store';

interface WatchButtonProps {
  thread: {
    id: string;
    slug: string;
    title: string;
    categoryId: string;
  };
  variant?: 'default' | 'compact' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export default function WatchButton({
  thread,
  variant = 'default',
  showLabel = true,
  className = '',
}: WatchButtonProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { user } = useAuthStore();
  const isSubscribed = useSubscriptionStore(state => state.isSubscribed(thread.id));
  const toggleSubscription = useSubscriptionStore(state => state.toggleSubscription);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't render during SSR or if not authenticated
  if (!isHydrated) {
    return null;
  }

  if (!user) {
    return null; // Only show for logged-in users
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = toggleSubscription(thread);

    if (newState) {
      // Show success animation briefly
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    }
  };

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`
          relative p-2 rounded-lg transition-all
          ${isSubscribed
            ? 'text-purple-400 bg-purple-500/20 hover:bg-purple-500/30'
            : 'text-slate-400 hover:text-purple-400 hover:bg-slate-700/50'
          }
          ${className}
        `}
        title={isSubscribed ? 'Unwatch thread' : 'Watch thread'}
        aria-label={isSubscribed ? 'Unwatch thread' : 'Watch thread'}
      >
        {showSuccess ? (
          <Check className="w-4 h-4 text-green-400 animate-pulse" />
        ) : isSubscribed ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </button>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all
          ${isSubscribed
            ? 'text-purple-400 bg-purple-500/20 hover:bg-purple-500/30'
            : 'text-slate-400 hover:text-purple-400 bg-slate-700/50 hover:bg-slate-700'
          }
          ${className}
        `}
        title={isSubscribed ? 'Unwatch thread' : 'Watch thread'}
      >
        {showSuccess ? (
          <Check className="w-3 h-3 text-green-400" />
        ) : isSubscribed ? (
          <Eye className="w-3 h-3" />
        ) : (
          <EyeOff className="w-3 h-3" />
        )}
        {showLabel && (
          <span>{isSubscribed ? 'Watching' : 'Watch'}</span>
        )}
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
        ${isSubscribed
          ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30'
          : 'text-slate-300 bg-slate-800 border border-slate-700 hover:text-purple-400 hover:border-purple-500/50'
        }
        ${className}
      `}
      title={isSubscribed ? 'Unwatch thread' : 'Watch thread'}
    >
      {showSuccess ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          {showLabel && <span className="text-green-400">Subscribed!</span>}
        </>
      ) : isSubscribed ? (
        <>
          <Eye className="w-4 h-4" />
          {showLabel && <span>Watching</span>}
        </>
      ) : (
        <>
          <EyeOff className="w-4 h-4" />
          {showLabel && <span>Watch</span>}
        </>
      )}
    </button>
  );
}

/**
 * Watch indicator badge for thread lists
 */
export function WatchingBadge({ threadId }: { threadId: string }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const isSubscribed = useSubscriptionStore(state => state.isSubscribed(threadId));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || !isSubscribed) {
    return null;
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded bg-purple-500/20 text-purple-400"
      title="You're watching this thread"
    >
      <Eye className="w-3 h-3" />
    </span>
  );
}

/**
 * Notification settings dropdown for a subscription
 */
export function WatchSettingsDropdown({
  threadId,
  className = '',
}: {
  threadId: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const subscription = useSubscriptionStore(state => state.getSubscription(threadId));
  const updateSettings = useSubscriptionStore(state => state.updateSubscriptionSettings);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || !subscription) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-300 transition-colors"
        title="Notification settings"
      >
        {subscription.notifyOnReply ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-2">
            <div className="px-3 py-2 border-b border-slate-700">
              <h4 className="text-sm font-medium text-white">Notification Settings</h4>
            </div>

            <div className="py-1">
              <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscription.notifyOnReply}
                  onChange={(e) => updateSettings(threadId, { notifyOnReply: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-slate-300">Notify on new replies</span>
              </label>

              <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscription.notifyOnMention}
                  onChange={(e) => updateSettings(threadId, { notifyOnMention: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-slate-300">Notify on mentions</span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
