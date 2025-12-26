import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './auth-store';

// Available reaction types
export const REACTION_TYPES = {
  like: { emoji: '👍', label: 'Like' },
  love: { emoji: '❤️', label: 'Love' },
  fire: { emoji: '🔥', label: 'Fire' },
  laugh: { emoji: '😂', label: 'Laugh' },
  wow: { emoji: '😮', label: 'Wow' },
  sad: { emoji: '😢', label: 'Sad' },
} as const;

export type ReactionType = keyof typeof REACTION_TYPES;

// Reaction data structure
export interface Reaction {
  type: ReactionType;
  userId: string;
  createdAt: string;
}

// Content reactions - keyed by contentId (thread-{id} or reply-{id})
export interface ContentReactions {
  [reactionType: string]: string[]; // Map of reaction type to user IDs
}

interface ReactionState {
  // Reactions keyed by content ID
  reactions: Record<string, ContentReactions>;

  // Actions
  addReaction: (contentId: string, reactionType: ReactionType) => boolean;
  removeReaction: (contentId: string, reactionType: ReactionType) => boolean;
  toggleReaction: (contentId: string, reactionType: ReactionType) => boolean;

  // Queries
  getReactions: (contentId: string) => ContentReactions;
  getUserReaction: (contentId: string, userId: string) => ReactionType | null;
  getReactionCount: (contentId: string, reactionType: ReactionType) => number;
  getTotalReactionCount: (contentId: string) => number;
  hasUserReacted: (contentId: string, userId: string, reactionType?: ReactionType) => boolean;
}

export const useReactionStore = create<ReactionState>()(
  persist(
    (set, get) => ({
      reactions: {},

      addReaction: (contentId: string, reactionType: ReactionType) => {
        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user) return false;

        const { reactions } = get();
        const contentReactions = reactions[contentId] || {};

        // Check if user already has this reaction
        if (contentReactions[reactionType]?.includes(user.id)) {
          return false;
        }

        // Remove any existing reaction from this user on this content
        const updatedReactions: ContentReactions = {};
        for (const [type, userIds] of Object.entries(contentReactions)) {
          updatedReactions[type] = userIds.filter(id => id !== user.id);
          // Remove empty arrays
          if (updatedReactions[type].length === 0) {
            delete updatedReactions[type];
          }
        }

        // Add the new reaction
        updatedReactions[reactionType] = [
          ...(updatedReactions[reactionType] || []),
          user.id,
        ];

        set({
          reactions: {
            ...reactions,
            [contentId]: updatedReactions,
          },
        });

        return true;
      },

      removeReaction: (contentId: string, reactionType: ReactionType) => {
        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user) return false;

        const { reactions } = get();
        const contentReactions = reactions[contentId];

        if (!contentReactions || !contentReactions[reactionType]?.includes(user.id)) {
          return false;
        }

        const updatedUserIds = contentReactions[reactionType].filter(id => id !== user.id);
        const updatedReactions = { ...contentReactions };

        if (updatedUserIds.length === 0) {
          delete updatedReactions[reactionType];
        } else {
          updatedReactions[reactionType] = updatedUserIds;
        }

        // If no reactions left, remove the content entry
        if (Object.keys(updatedReactions).length === 0) {
          const { [contentId]: _, ...rest } = reactions;
          set({ reactions: rest });
        } else {
          set({
            reactions: {
              ...reactions,
              [contentId]: updatedReactions,
            },
          });
        }

        return true;
      },

      toggleReaction: (contentId: string, reactionType: ReactionType) => {
        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user) return false;

        const { reactions, addReaction, removeReaction } = get();
        const contentReactions = reactions[contentId] || {};

        // If user already has this reaction, remove it
        if (contentReactions[reactionType]?.includes(user.id)) {
          return removeReaction(contentId, reactionType);
        }

        // Otherwise add/switch to this reaction
        return addReaction(contentId, reactionType);
      },

      getReactions: (contentId: string) => {
        const { reactions } = get();
        return reactions[contentId] || {};
      },

      getUserReaction: (contentId: string, userId: string) => {
        const { reactions } = get();
        const contentReactions = reactions[contentId] || {};

        for (const [type, userIds] of Object.entries(contentReactions)) {
          if (userIds.includes(userId)) {
            return type as ReactionType;
          }
        }

        return null;
      },

      getReactionCount: (contentId: string, reactionType: ReactionType) => {
        const { reactions } = get();
        return reactions[contentId]?.[reactionType]?.length || 0;
      },

      getTotalReactionCount: (contentId: string) => {
        const { reactions } = get();
        const contentReactions = reactions[contentId] || {};

        return Object.values(contentReactions).reduce(
          (total, userIds) => total + userIds.length,
          0
        );
      },

      hasUserReacted: (contentId: string, userId: string, reactionType?: ReactionType) => {
        const { reactions } = get();
        const contentReactions = reactions[contentId] || {};

        if (reactionType) {
          return contentReactions[reactionType]?.includes(userId) || false;
        }

        // Check if user has any reaction
        return Object.values(contentReactions).some(userIds => userIds.includes(userId));
      },
    }),
    {
      name: 'tcg-forum-reactions',
    }
  )
);

// Helper hook for using reactions on a specific content
export function useContentReactions(contentId: string) {
  const {
    getReactions,
    getUserReaction,
    getTotalReactionCount,
    toggleReaction,
    hasUserReacted,
  } = useReactionStore();

  const { user } = useAuthStore();

  return {
    reactions: getReactions(contentId),
    userReaction: user ? getUserReaction(contentId, user.id) : null,
    totalCount: getTotalReactionCount(contentId),
    hasReacted: user ? hasUserReacted(contentId, user.id) : false,
    toggle: (reactionType: ReactionType) => toggleReaction(contentId, reactionType),
  };
}
