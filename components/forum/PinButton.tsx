'use client';

import React, { useState } from 'react';
import { Pin, Loader2 } from 'lucide-react';
import { useThreadStore } from '@/lib/thread-store';
import { showSuccessToast, showErrorToast } from '@/lib/toast-store';
import { useAuth } from '@/lib/hooks';

interface PinButtonProps {
  threadId: string;
  variant?: 'icon' | 'button';
  className?: string;
  showLabel?: boolean;
}

export default function PinButton({
  threadId,
  variant = 'button',
  className = '',
  showLabel = true,
}: PinButtonProps) {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const { togglePin, isThreadPinned } = useThreadStore();
  const [isLoading, setIsLoading] = useState(false);

  const isPinned = isThreadPinned(threadId);
  const canPin = user && (user.role === 'admin' || user.role === 'moderator');

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !canPin) {
      showErrorToast('Permission denied', 'Only moderators can pin threads');
      return;
    }

    setIsLoading(true);

    try {
      // Pass verified role since we already checked permissions above
      const verifiedRole = user?.role === 'admin' ? 'admin' : 'moderator';
      const success = togglePin(threadId, verifiedRole);

      if (success) {
        const newPinned = isThreadPinned(threadId);
        showSuccessToast(
          newPinned ? 'Thread pinned' : 'Thread unpinned',
          newPinned
            ? 'Thread will appear at the top of the forum'
            : 'Thread removed from pinned position'
        );
      } else {
        showErrorToast('Failed to update', 'Could not update pin status');
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      showErrorToast('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show until hydrated
  if (!isHydrated) {
    return null;
  }

  // Only show to admins and moderators
  if (!isAuthenticated || !canPin) {
    return null;
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        className={`pin-btn-icon ${isPinned ? 'pinned' : ''} ${className}`}
        title={isPinned ? 'Unpin thread' : 'Pin thread'}
        disabled={isLoading}
        aria-label={isPinned ? 'Unpin thread' : 'Pin thread'}
        data-pin-button
      >
        {isLoading ? (
          <Loader2 size={16} className="spin" />
        ) : (
          <Pin size={16} fill={isPinned ? 'currentColor' : 'none'} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`post-action-btn ${isPinned ? 'pinned' : ''} ${className}`}
      title={isPinned ? 'Unpin thread' : 'Pin thread'}
      disabled={isLoading}
      data-pin-button
    >
      {isLoading ? (
        <Loader2 size={16} className="spin" />
      ) : (
        <Pin size={16} fill={isPinned ? 'currentColor' : 'none'} />
      )}
      {showLabel && <span>{isPinned ? 'Pinned' : 'Pin'}</span>}
    </button>
  );
}
