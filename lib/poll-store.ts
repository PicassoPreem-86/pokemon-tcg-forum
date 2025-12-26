import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Poll, PollOption, CreatePollData } from './types';

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Poll store state
 */
interface PollState {
  // Map of threadId -> Poll
  polls: Record<string, Poll>;
  // Map of userId -> { odId: optionIds[] } for user votes
  userVotes: Record<string, Record<string, string[]>>;

  // Actions
  createPoll: (threadId: string, data: CreatePollData) => Poll;
  vote: (threadId: string, userId: string, optionIds: string[]) => boolean;
  removeVote: (threadId: string, userId: string) => void;
  deletePoll: (threadId: string) => void;

  // Queries
  getPoll: (threadId: string) => Poll | undefined;
  hasVoted: (threadId: string, userId: string) => boolean;
  getUserVotes: (threadId: string, userId: string) => string[];
  isPollExpired: (threadId: string) => boolean;
  canUserVote: (threadId: string, userId: string) => boolean;
  getVotePercentage: (threadId: string, optionId: string) => number;
}

export const usePollStore = create<PollState>()(
  persist(
    (set, get) => ({
      polls: {},
      userVotes: {},

      /**
       * Create a new poll for a thread
       */
      createPoll: (threadId, data) => {
        const poll: Poll = {
          id: generateId(),
          threadId,
          question: data.question,
          options: data.options.map((text, index) => ({
            id: `opt-${index}-${generateId()}`,
            text,
            voteCount: 0,
            voterIds: [],
          })),
          createdAt: new Date().toISOString(),
          expiresAt: data.expiresAt,
          isExpired: false,
          allowMultipleVotes: data.allowMultipleVotes ?? false,
          allowVoteChange: data.allowVoteChange ?? true,
          showResultsBeforeVote: data.showResultsBeforeVote ?? false,
          isAnonymous: data.isAnonymous ?? false,
          totalVotes: 0,
          voterCount: 0,
        };

        set(state => ({
          polls: {
            ...state.polls,
            [threadId]: poll,
          },
        }));

        return poll;
      },

      /**
       * Cast a vote on a poll
       */
      vote: (threadId, userId, optionIds) => {
        const { polls, userVotes, canUserVote, hasVoted, removeVote } = get();
        const poll = polls[threadId];

        if (!poll) return false;
        if (!canUserVote(threadId, userId)) return false;

        // If user has voted before and vote change is allowed, remove old votes first
        if (hasVoted(threadId, userId) && poll.allowVoteChange) {
          removeVote(threadId, userId);
        }

        // Validate option IDs
        const validOptionIds = optionIds.filter(id =>
          poll.options.some(opt => opt.id === id)
        );

        if (validOptionIds.length === 0) return false;

        // If multiple votes not allowed, only use first option
        const finalOptionIds = poll.allowMultipleVotes
          ? validOptionIds
          : [validOptionIds[0]];

        set(state => {
          const currentPoll = state.polls[threadId];
          if (!currentPoll) return state;

          // Update options with new votes
          const updatedOptions = currentPoll.options.map(option => {
            if (finalOptionIds.includes(option.id)) {
              return {
                ...option,
                voteCount: option.voteCount + 1,
                voterIds: currentPoll.isAnonymous
                  ? option.voterIds
                  : [...option.voterIds, userId],
              };
            }
            return option;
          });

          // Track user's votes
          const userPollVotes = state.userVotes[userId] || {};

          return {
            polls: {
              ...state.polls,
              [threadId]: {
                ...currentPoll,
                options: updatedOptions,
                totalVotes: currentPoll.totalVotes + finalOptionIds.length,
                voterCount: currentPoll.voterCount + 1,
              },
            },
            userVotes: {
              ...state.userVotes,
              [userId]: {
                ...userPollVotes,
                [threadId]: finalOptionIds,
              },
            },
          };
        });

        return true;
      },

      /**
       * Remove a user's vote from a poll
       */
      removeVote: (threadId, userId) => {
        const { polls, userVotes } = get();
        const poll = polls[threadId];
        const userPollVotes = userVotes[userId]?.[threadId];

        if (!poll || !userPollVotes) return;

        set(state => {
          const currentPoll = state.polls[threadId];
          if (!currentPoll) return state;

          // Remove votes from options
          const updatedOptions = currentPoll.options.map(option => {
            if (userPollVotes.includes(option.id)) {
              return {
                ...option,
                voteCount: Math.max(0, option.voteCount - 1),
                voterIds: option.voterIds.filter(id => id !== userId),
              };
            }
            return option;
          });

          // Remove user's vote record
          const { [threadId]: removed, ...remainingVotes } = state.userVotes[userId] || {};

          return {
            polls: {
              ...state.polls,
              [threadId]: {
                ...currentPoll,
                options: updatedOptions,
                totalVotes: Math.max(0, currentPoll.totalVotes - userPollVotes.length),
                voterCount: Math.max(0, currentPoll.voterCount - 1),
              },
            },
            userVotes: {
              ...state.userVotes,
              [userId]: remainingVotes,
            },
          };
        });
      },

      /**
       * Delete a poll
       */
      deletePoll: (threadId) => {
        set(state => {
          const { [threadId]: removed, ...remainingPolls } = state.polls;
          return { polls: remainingPolls };
        });
      },

      /**
       * Get poll for a thread
       */
      getPoll: (threadId) => {
        const poll = get().polls[threadId];
        if (!poll) return undefined;

        // Check if expired
        if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
          return { ...poll, isExpired: true };
        }

        return poll;
      },

      /**
       * Check if user has voted
       */
      hasVoted: (threadId, userId) => {
        const userPollVotes = get().userVotes[userId]?.[threadId];
        return userPollVotes && userPollVotes.length > 0;
      },

      /**
       * Get user's voted option IDs
       */
      getUserVotes: (threadId, userId) => {
        return get().userVotes[userId]?.[threadId] || [];
      },

      /**
       * Check if poll is expired
       */
      isPollExpired: (threadId) => {
        const poll = get().polls[threadId];
        if (!poll || !poll.expiresAt) return false;
        return new Date(poll.expiresAt) < new Date();
      },

      /**
       * Check if user can vote on a poll
       */
      canUserVote: (threadId, userId) => {
        const { polls, hasVoted, isPollExpired } = get();
        const poll = polls[threadId];

        if (!poll) return false;
        if (isPollExpired(threadId)) return false;

        const userHasVoted = hasVoted(threadId, userId);
        if (userHasVoted && !poll.allowVoteChange) return false;

        return true;
      },

      /**
       * Get vote percentage for an option
       */
      getVotePercentage: (threadId, optionId) => {
        const poll = get().polls[threadId];
        if (!poll || poll.totalVotes === 0) return 0;

        const option = poll.options.find(opt => opt.id === optionId);
        if (!option) return 0;

        return Math.round((option.voteCount / poll.totalVotes) * 100);
      },
    }),
    {
      name: 'tcg-forum-polls',
      partialize: (state) => ({
        polls: state.polls,
        userVotes: state.userVotes,
      }),
    }
  )
);

/**
 * Hook to get poll data and actions for a specific thread
 */
export function useThreadPoll(threadId: string) {
  const poll = usePollStore(state => state.getPoll(threadId));
  const hasVoted = usePollStore(state => state.hasVoted);
  const getUserVotes = usePollStore(state => state.getUserVotes);
  const vote = usePollStore(state => state.vote);
  const removeVote = usePollStore(state => state.removeVote);
  const canUserVote = usePollStore(state => state.canUserVote);
  const getVotePercentage = usePollStore(state => state.getVotePercentage);
  const isPollExpired = usePollStore(state => state.isPollExpired);

  return {
    poll,
    hasVoted: (userId: string) => hasVoted(threadId, userId),
    getUserVotes: (userId: string) => getUserVotes(threadId, userId),
    vote: (userId: string, optionIds: string[]) => vote(threadId, userId, optionIds),
    removeVote: (userId: string) => removeVote(threadId, userId),
    canUserVote: (userId: string) => canUserVote(threadId, userId),
    getVotePercentage: (optionId: string) => getVotePercentage(threadId, optionId),
    isExpired: isPollExpired(threadId),
  };
}
