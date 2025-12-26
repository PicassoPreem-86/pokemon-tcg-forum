'use client';

import { useEffect, useState } from 'react';
import { Circle, MessageSquarePlus, Sparkles } from 'lucide-react';
import { useUnreadStore, formatUnreadCount } from '@/lib/unread-store';

interface UnreadIndicatorProps {
  threadId: string;
  currentPostCount: number;
  variant?: 'dot' | 'badge' | 'full';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Shows an unread indicator for a thread
 * - dot: Simple blue dot
 * - badge: Shows "X new" count
 * - full: Shows both dot and detailed info
 */
export default function UnreadIndicator({
  threadId,
  currentPostCount,
  variant = 'badge',
  size = 'sm',
}: UnreadIndicatorProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const isUnread = useUnreadStore(state => state.isThreadUnread(threadId, currentPostCount));
  const unreadCount = useUnreadStore(state => state.getUnreadCount(threadId, currentPostCount));
  const hasVisited = useUnreadStore(state => state.hasVisitedThread(threadId));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't render during SSR to avoid hydration mismatch
  if (!isHydrated) return null;

  // No unread posts
  if (!isUnread) return null;

  const sizeClasses = {
    sm: {
      dot: 'w-2 h-2',
      badge: 'text-xs px-1.5 py-0.5',
      icon: 'w-3 h-3',
    },
    md: {
      dot: 'w-2.5 h-2.5',
      badge: 'text-xs px-2 py-0.5',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      dot: 'w-3 h-3',
      badge: 'text-sm px-2.5 py-1',
      icon: 'w-4 h-4',
    },
  };

  const classes = sizeClasses[size];

  // Simple dot indicator
  if (variant === 'dot') {
    return (
      <span
        className={`${classes.dot} rounded-full bg-blue-500 animate-pulse`}
        title={hasVisited ? `${unreadCount} new replies` : 'New thread'}
      />
    );
  }

  // Badge with count
  if (variant === 'badge') {
    // Thread never visited - show "NEW" badge
    if (!hasVisited) {
      return (
        <span
          className={`inline-flex items-center gap-1 ${classes.badge} rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium`}
        >
          <Sparkles className={classes.icon} />
          NEW
        </span>
      );
    }

    // Has unread replies
    if (unreadCount > 0) {
      return (
        <span
          className={`inline-flex items-center gap-1 ${classes.badge} rounded-full bg-blue-500/20 text-blue-400 font-medium`}
        >
          <MessageSquarePlus className={classes.icon} />
          {formatUnreadCount(unreadCount)} new
        </span>
      );
    }
  }

  // Full variant with dot + badge
  if (variant === 'full') {
    return (
      <div className="flex items-center gap-2">
        <span className={`${classes.dot} rounded-full bg-blue-500 animate-pulse shrink-0`} />
        {!hasVisited ? (
          <span
            className={`inline-flex items-center gap-1 ${classes.badge} rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium`}
          >
            <Sparkles className={classes.icon} />
            NEW
          </span>
        ) : unreadCount > 0 ? (
          <span
            className={`inline-flex items-center gap-1 ${classes.badge} rounded-full bg-blue-500/20 text-blue-400 font-medium`}
          >
            {formatUnreadCount(unreadCount)} new replies
          </span>
        ) : null}
      </div>
    );
  }

  return null;
}

/**
 * Simple blue dot for compact displays
 */
export function UnreadDot({
  threadId,
  currentPostCount,
  className = '',
}: {
  threadId: string;
  currentPostCount: number;
  className?: string;
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const isUnread = useUnreadStore(state => state.isThreadUnread(threadId, currentPostCount));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || !isUnread) return null;

  return (
    <span
      className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0 ${className}`}
      aria-label="Unread"
    />
  );
}

/**
 * "NEW" badge for threads never visited
 */
export function NewThreadBadge({
  threadId,
  size = 'sm',
}: {
  threadId: string;
  size?: 'sm' | 'md';
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const hasVisited = useUnreadStore(state => state.hasVisitedThread(threadId));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || hasVisited) return null;

  const sizeClasses = size === 'sm'
    ? 'text-xs px-1.5 py-0.5'
    : 'text-sm px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClasses} rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium`}
    >
      <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      NEW
    </span>
  );
}

/**
 * Unread count badge
 */
export function UnreadCountBadge({
  threadId,
  currentPostCount,
  size = 'sm',
}: {
  threadId: string;
  currentPostCount: number;
  size?: 'sm' | 'md';
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const unreadCount = useUnreadStore(state => state.getUnreadCount(threadId, currentPostCount));
  const hasVisited = useUnreadStore(state => state.hasVisitedThread(threadId));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't show count if never visited (show NEW badge instead) or no unread
  if (!isHydrated || !hasVisited || unreadCount <= 0) return null;

  const sizeClasses = size === 'sm'
    ? 'text-xs px-1.5 py-0.5'
    : 'text-sm px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClasses} rounded-full bg-blue-500/20 text-blue-400 font-medium`}
    >
      +{formatUnreadCount(unreadCount)}
    </span>
  );
}
