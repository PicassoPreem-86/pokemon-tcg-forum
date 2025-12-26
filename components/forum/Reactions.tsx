'use client';

import { useState, useEffect, useRef } from 'react';
import { SmilePlus } from 'lucide-react';
import {
  REACTION_TYPES,
  ReactionType,
  useContentReactions,
  useReactionStore,
  ContentReactions,
} from '@/lib/reaction-store';
import { useAuthStore } from '@/lib/auth-store';

interface ReactionPickerProps {
  contentId: string;
  onReact?: (reactionType: ReactionType) => void;
  className?: string;
}

/**
 * Reaction picker - shows emoji options when clicked
 */
export function ReactionPicker({ contentId, onReact, className = '' }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  const { toggle, userReaction } = useContentReactions(contentId);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleReaction = (reactionType: ReactionType) => {
    if (!user) return;

    toggle(reactionType);
    onReact?.(reactionType);
    setIsOpen(false);
  };

  if (!isHydrated) {
    return (
      <button className={`reaction-picker-btn ${className}`} disabled>
        <SmilePlus size={16} />
      </button>
    );
  }

  return (
    <div className="reaction-picker-container" ref={pickerRef}>
      <button
        className={`reaction-picker-btn ${className} ${userReaction ? 'has-reaction' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={!user}
        title={user ? 'Add reaction' : 'Log in to react'}
      >
        {userReaction ? (
          <span className="current-reaction">{REACTION_TYPES[userReaction].emoji}</span>
        ) : (
          <SmilePlus size={16} />
        )}
      </button>

      {isOpen && (
        <div className="reaction-picker-dropdown">
          {Object.entries(REACTION_TYPES).map(([type, { emoji, label }]) => (
            <button
              key={type}
              className={`reaction-option ${userReaction === type ? 'selected' : ''}`}
              onClick={() => handleReaction(type as ReactionType)}
              title={label}
            >
              <span className="reaction-emoji">{emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ReactionDisplayProps {
  contentId: string;
  showPicker?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Displays reactions for content with counts
 */
export function ReactionDisplay({
  contentId,
  showPicker = true,
  compact = false,
  className = '',
}: ReactionDisplayProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { user } = useAuthStore();
  const { reactions, userReaction, toggle } = useContentReactions(contentId);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Get sorted reactions by count (descending)
  const sortedReactions = Object.entries(reactions)
    .map(([type, userIds]) => ({
      type: type as ReactionType,
      count: userIds.length,
      hasUserReacted: user ? userIds.includes(user.id) : false,
    }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const handleReactionClick = (reactionType: ReactionType) => {
    if (!user) return;
    toggle(reactionType);
  };

  if (!isHydrated) {
    return <div className={`reaction-display ${className}`} />;
  }

  const hasReactions = sortedReactions.length > 0;

  return (
    <div className={`reaction-display ${compact ? 'compact' : ''} ${className}`}>
      {/* Existing reactions */}
      {hasReactions && (
        <div className="reaction-badges">
          {sortedReactions.map(({ type, count, hasUserReacted }) => (
            <button
              key={type}
              className={`reaction-badge ${hasUserReacted ? 'user-reacted' : ''}`}
              onClick={() => handleReactionClick(type)}
              title={`${REACTION_TYPES[type].label} (${count})`}
              disabled={!user}
            >
              <span className="reaction-emoji">{REACTION_TYPES[type].emoji}</span>
              <span className="reaction-count">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Add reaction button */}
      {showPicker && (
        <ReactionPicker
          contentId={contentId}
          className={hasReactions ? 'with-reactions' : ''}
        />
      )}
    </div>
  );
}

interface ReactionBarProps {
  contentId: string;
  className?: string;
}

/**
 * Complete reaction bar with display and picker
 * Use this as a drop-in replacement for like buttons
 */
export function ReactionBar({ contentId, className = '' }: ReactionBarProps) {
  return (
    <ReactionDisplay
      contentId={contentId}
      showPicker={true}
      compact={false}
      className={className}
    />
  );
}

/**
 * Compact reaction summary - just shows emoji icons and total count
 * Good for thread list previews
 */
export function ReactionSummary({ contentId, className = '' }: { contentId: string; className?: string }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const reactions = useReactionStore(state => state.getReactions(contentId));
  const totalCount = useReactionStore(state => state.getTotalReactionCount(contentId));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || totalCount === 0) {
    return null;
  }

  // Get unique reaction types used
  const usedTypes = Object.keys(reactions) as ReactionType[];
  const topReactions = usedTypes.slice(0, 3);

  return (
    <div className={`reaction-summary ${className}`}>
      <span className="reaction-summary-emojis">
        {topReactions.map(type => (
          <span key={type} className="summary-emoji">
            {REACTION_TYPES[type].emoji}
          </span>
        ))}
      </span>
      <span className="reaction-summary-count">{totalCount}</span>
    </div>
  );
}

export default ReactionDisplay;
