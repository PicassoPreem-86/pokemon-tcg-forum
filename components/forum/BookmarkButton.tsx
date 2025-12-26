'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { toggleBookmark, isBookmarked } from '@/lib/actions/bookmarks';
import { showSuccessToast, showErrorToast } from '@/lib/toast-store';
import { useAuth } from '@/lib/hooks';

interface BookmarkButtonProps {
  threadId: string;
  variant?: 'icon' | 'button';
  className?: string;
  showLabel?: boolean;
}

export default function BookmarkButton({
  threadId,
  variant = 'button',
  className = '',
  showLabel = true,
}: BookmarkButtonProps) {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Check bookmark status on mount
  useEffect(() => {
    async function checkBookmarkStatus() {
      if (!isHydrated || !isAuthenticated || !user) {
        setIsCheckingStatus(false);
        return;
      }

      try {
        const status = await isBookmarked(threadId);
        setBookmarked(status);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    }

    checkBookmarkStatus();
  }, [threadId, isHydrated, isAuthenticated, user]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      showErrorToast('Login required', 'Please log in to bookmark threads');
      return;
    }

    // Optimistic update
    const previousState = bookmarked;
    setBookmarked(!bookmarked);
    setIsLoading(true);

    try {
      const result = await toggleBookmark(threadId);

      if (result.success) {
        setBookmarked(result.isBookmarked ?? !previousState);
        showSuccessToast(
          result.isBookmarked ? 'Bookmarked' : 'Bookmark removed',
          result.isBookmarked
            ? 'Thread added to your bookmarks'
            : 'Thread removed from your bookmarks'
        );
      } else {
        // Revert on error
        setBookmarked(previousState);
        showErrorToast('Failed to update', result.error || 'Could not update bookmark');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert on error
      setBookmarked(previousState);
      showErrorToast('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show until we've checked auth status
  if (!isHydrated) {
    return null;
  }

  // Don't show to unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        className={`bookmark-btn-icon ${bookmarked ? 'bookmarked' : ''} ${className}`}
        title={bookmarked ? 'Remove bookmark' : 'Bookmark this thread'}
        disabled={isLoading || isCheckingStatus}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this thread'}
        data-bookmark-button
      >
        {isLoading || isCheckingStatus ? (
          <Loader2 size={16} className="spin" />
        ) : (
          <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`post-action-btn ${bookmarked ? 'bookmarked' : ''} ${className}`}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark this thread'}
      disabled={isLoading || isCheckingStatus}
      data-bookmark-button
    >
      {isLoading || isCheckingStatus ? (
        <Loader2 size={16} className="spin" />
      ) : (
        <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
      )}
      {showLabel && <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>}
    </button>
  );
}
