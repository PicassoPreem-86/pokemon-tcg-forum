import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Tracks the last time a user read a thread and how many posts it had
 */
export interface ThreadReadState {
  lastReadAt: string;        // ISO timestamp of last read
  lastReadPostCount: number; // Number of posts when last read
  lastReadPostId?: string;   // Optional: ID of last post read for scroll position
}

/**
 * Unread tracking state
 */
interface UnreadState {
  // Map of threadId -> read state
  readThreads: Record<string, ThreadReadState>;

  // When the user last visited the forum (for "new since last visit")
  lastForumVisit: string | null;

  // Actions
  markThreadAsRead: (threadId: string, postCount: number, lastPostId?: string) => void;
  markAllAsRead: (threads: { id: string; postCount: number }[]) => void;
  markCategoryAsRead: (categoryId: string, threads: { id: string; postCount: number }[]) => void;

  // Queries
  isThreadUnread: (threadId: string, currentPostCount: number) => boolean;
  getUnreadCount: (threadId: string, currentPostCount: number) => number;
  getLastReadPostId: (threadId: string) => string | undefined;
  getLastReadAt: (threadId: string) => string | undefined;
  hasVisitedThread: (threadId: string) => boolean;

  // Utility
  recordForumVisit: () => void;
  clearReadHistory: () => void;
  getReadThreadCount: () => number;
}

export const useUnreadStore = create<UnreadState>()(
  persist(
    (set, get) => ({
      readThreads: {},
      lastForumVisit: null,

      /**
       * Mark a specific thread as read
       */
      markThreadAsRead: (threadId: string, postCount: number, lastPostId?: string) => {
        set(state => ({
          readThreads: {
            ...state.readThreads,
            [threadId]: {
              lastReadAt: new Date().toISOString(),
              lastReadPostCount: postCount,
              lastReadPostId: lastPostId,
            },
          },
        }));
      },

      /**
       * Mark multiple threads as read at once
       */
      markAllAsRead: (threads: { id: string; postCount: number }[]) => {
        const now = new Date().toISOString();
        set(state => {
          const newReadThreads = { ...state.readThreads };
          threads.forEach(thread => {
            newReadThreads[thread.id] = {
              lastReadAt: now,
              lastReadPostCount: thread.postCount,
            };
          });
          return { readThreads: newReadThreads };
        });
      },

      /**
       * Mark all threads in a category as read
       */
      markCategoryAsRead: (categoryId: string, threads: { id: string; postCount: number }[]) => {
        // This is the same as markAllAsRead but could include category-specific logic
        get().markAllAsRead(threads);
      },

      /**
       * Check if a thread has unread posts
       */
      isThreadUnread: (threadId: string, currentPostCount: number) => {
        const { readThreads } = get();
        const readState = readThreads[threadId];

        // Never visited = unread
        if (!readState) return true;

        // Has new posts since last read
        return currentPostCount > readState.lastReadPostCount;
      },

      /**
       * Get the number of unread posts in a thread
       */
      getUnreadCount: (threadId: string, currentPostCount: number) => {
        const { readThreads } = get();
        const readState = readThreads[threadId];

        // Never visited = all posts are "new"
        if (!readState) return currentPostCount;

        // Calculate difference
        const unread = currentPostCount - readState.lastReadPostCount;
        return Math.max(0, unread);
      },

      /**
       * Get the last post ID that was read (for scroll position)
       */
      getLastReadPostId: (threadId: string) => {
        const { readThreads } = get();
        return readThreads[threadId]?.lastReadPostId;
      },

      /**
       * Get when the thread was last read
       */
      getLastReadAt: (threadId: string) => {
        const { readThreads } = get();
        return readThreads[threadId]?.lastReadAt;
      },

      /**
       * Check if user has ever visited this thread
       */
      hasVisitedThread: (threadId: string) => {
        const { readThreads } = get();
        return threadId in readThreads;
      },

      /**
       * Record when the user visited the forum (for "new since last visit" feature)
       */
      recordForumVisit: () => {
        set({ lastForumVisit: new Date().toISOString() });
      },

      /**
       * Clear all read history (useful for testing or user preference)
       */
      clearReadHistory: () => {
        set({ readThreads: {}, lastForumVisit: null });
      },

      /**
       * Get count of threads that have been read
       */
      getReadThreadCount: () => {
        return Object.keys(get().readThreads).length;
      },
    }),
    {
      name: 'tcg-forum-unread',
      partialize: (state) => ({
        readThreads: state.readThreads,
        lastForumVisit: state.lastForumVisit,
      }),
    }
  )
);

/**
 * Hook to get unread status for a specific thread
 */
export function useThreadUnreadStatus(threadId: string, currentPostCount: number) {
  const isUnread = useUnreadStore(state => state.isThreadUnread(threadId, currentPostCount));
  const unreadCount = useUnreadStore(state => state.getUnreadCount(threadId, currentPostCount));
  const hasVisited = useUnreadStore(state => state.hasVisitedThread(threadId));

  return {
    isUnread,
    unreadCount,
    hasVisited,
    isNew: !hasVisited, // Thread they've never seen before
  };
}

/**
 * Hook to get total unread count across multiple threads
 */
export function useTotalUnreadCount(threads: { id: string; postCount: number }[]) {
  const readThreads = useUnreadStore(state => state.readThreads);

  let totalUnread = 0;
  let threadsWithUnread = 0;

  threads.forEach(thread => {
    const readState = readThreads[thread.id];
    if (!readState) {
      // Never visited
      totalUnread += thread.postCount;
      threadsWithUnread++;
    } else if (thread.postCount > readState.lastReadPostCount) {
      totalUnread += thread.postCount - readState.lastReadPostCount;
      threadsWithUnread++;
    }
  });

  return { totalUnread, threadsWithUnread };
}

/**
 * Format unread count for display
 */
export function formatUnreadCount(count: number): string {
  if (count <= 0) return '';
  if (count > 99) return '99+';
  return count.toString();
}
