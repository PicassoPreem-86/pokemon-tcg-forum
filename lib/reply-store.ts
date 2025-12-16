import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './auth-store';

// Reply interface
export interface Reply {
  id: string;
  threadId: string;
  content: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    role: 'admin' | 'moderator' | 'vip' | 'member' | 'newbie';
    postCount: number;
    reputation: number;
    joinDate: string;
    location?: string;
    signature?: string;
  };
  createdAt: string;
  updatedAt: string;
  likes: number;
  likedBy: string[]; // User IDs who liked this reply
  quotedReplyId?: string; // If this reply quotes another reply
  isEdited: boolean;
}

// Reply creation data
export interface CreateReplyData {
  threadId: string;
  content: string;
  quotedReplyId?: string;
}

// Reply store state
interface ReplyState {
  // Replies organized by thread ID
  repliesByThread: Record<string, Reply[]>;

  // Actions
  createReply: (data: CreateReplyData) => Reply | null;
  getRepliesByThread: (threadId: string) => Reply[];
  getReplyById: (replyId: string) => Reply | undefined;
  deleteReply: (replyId: string) => boolean;
  editReply: (replyId: string, newContent: string) => boolean;
  likeReply: (replyId: string) => boolean;
  unlikeReply: (replyId: string) => boolean;
  getReplyCount: (threadId: string) => number;
}

// Generate unique reply ID
function generateReplyId(): string {
  return `reply-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Create the reply store
export const useReplyStore = create<ReplyState>()(
  persist(
    (set, get) => ({
      repliesByThread: {},

      createReply: (data: CreateReplyData) => {
        // Get current user from auth store
        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user) {
          console.error('Must be logged in to create a reply');
          return null;
        }

        // Validate content
        if (!data.content.trim() || data.content.trim().length < 5) {
          console.error('Reply must be at least 5 characters');
          return null;
        }

        if (!data.threadId) {
          console.error('Thread ID is required');
          return null;
        }

        const now = new Date().toISOString();
        const replyId = generateReplyId();

        const newReply: Reply = {
          id: replyId,
          threadId: data.threadId,
          content: data.content.trim(),
          author: {
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            avatar: user.avatar || '/images/avatars/default.png',
            role: user.role,
            postCount: user.postCount || 0,
            reputation: user.reputation || 0,
            joinDate: user.joinDate,
            location: user.location,
            signature: user.bio,
          },
          createdAt: now,
          updatedAt: now,
          likes: 0,
          likedBy: [],
          quotedReplyId: data.quotedReplyId,
          isEdited: false,
        };

        // Add reply to the thread's replies
        set((state) => {
          const threadReplies = state.repliesByThread[data.threadId] || [];
          return {
            repliesByThread: {
              ...state.repliesByThread,
              [data.threadId]: [...threadReplies, newReply],
            },
          };
        });

        // Update user's post count in auth store
        useAuthStore.getState().updateProfile({
          postCount: (user.postCount || 0) + 1,
        });

        return newReply;
      },

      getRepliesByThread: (threadId: string) => {
        const { repliesByThread } = get();
        return repliesByThread[threadId] || [];
      },

      getReplyById: (replyId: string) => {
        const { repliesByThread } = get();
        for (const replies of Object.values(repliesByThread)) {
          const reply = replies.find((r) => r.id === replyId);
          if (reply) return reply;
        }
        return undefined;
      },

      deleteReply: (replyId: string) => {
        const authState = useAuthStore.getState();
        const user = authState.user;
        const { repliesByThread } = get();

        // Find the reply
        let foundReply: Reply | undefined;
        let foundThreadId: string | undefined;

        for (const [threadId, replies] of Object.entries(repliesByThread)) {
          const reply = replies.find((r) => r.id === replyId);
          if (reply) {
            foundReply = reply;
            foundThreadId = threadId;
            break;
          }
        }

        if (!foundReply || !foundThreadId) return false;

        // Check if user owns the reply or is admin/mod
        if (user && (foundReply.author.id === user.id || user.role === 'admin' || user.role === 'moderator')) {
          set((state) => ({
            repliesByThread: {
              ...state.repliesByThread,
              [foundThreadId!]: state.repliesByThread[foundThreadId!].filter((r) => r.id !== replyId),
            },
          }));
          return true;
        }

        return false;
      },

      editReply: (replyId: string, newContent: string) => {
        const authState = useAuthStore.getState();
        const user = authState.user;
        const { repliesByThread } = get();

        if (!newContent.trim() || newContent.trim().length < 5) {
          console.error('Reply must be at least 5 characters');
          return false;
        }

        // Find the reply
        let foundThreadId: string | undefined;

        for (const [threadId, replies] of Object.entries(repliesByThread)) {
          const reply = replies.find((r) => r.id === replyId);
          if (reply) {
            // Check ownership
            if (user && reply.author.id === user.id) {
              foundThreadId = threadId;
              break;
            }
            return false;
          }
        }

        if (!foundThreadId) return false;

        set((state) => ({
          repliesByThread: {
            ...state.repliesByThread,
            [foundThreadId!]: state.repliesByThread[foundThreadId!].map((r) =>
              r.id === replyId
                ? {
                    ...r,
                    content: newContent.trim(),
                    updatedAt: new Date().toISOString(),
                    isEdited: true,
                  }
                : r
            ),
          },
        }));

        return true;
      },

      likeReply: (replyId: string) => {
        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user) return false;

        const { repliesByThread } = get();

        // Find the reply
        let foundThreadId: string | undefined;

        for (const [threadId, replies] of Object.entries(repliesByThread)) {
          const reply = replies.find((r) => r.id === replyId);
          if (reply) {
            // Check if already liked
            if (reply.likedBy.includes(user.id)) return false;
            foundThreadId = threadId;
            break;
          }
        }

        if (!foundThreadId) return false;

        set((state) => ({
          repliesByThread: {
            ...state.repliesByThread,
            [foundThreadId!]: state.repliesByThread[foundThreadId!].map((r) =>
              r.id === replyId
                ? {
                    ...r,
                    likes: r.likes + 1,
                    likedBy: [...r.likedBy, user.id],
                  }
                : r
            ),
          },
        }));

        return true;
      },

      unlikeReply: (replyId: string) => {
        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user) return false;

        const { repliesByThread } = get();

        // Find the reply
        let foundThreadId: string | undefined;

        for (const [threadId, replies] of Object.entries(repliesByThread)) {
          const reply = replies.find((r) => r.id === replyId);
          if (reply) {
            // Check if liked
            if (!reply.likedBy.includes(user.id)) return false;
            foundThreadId = threadId;
            break;
          }
        }

        if (!foundThreadId) return false;

        set((state) => ({
          repliesByThread: {
            ...state.repliesByThread,
            [foundThreadId!]: state.repliesByThread[foundThreadId!].map((r) =>
              r.id === replyId
                ? {
                    ...r,
                    likes: r.likes - 1,
                    likedBy: r.likedBy.filter((id) => id !== user.id),
                  }
                : r
            ),
          },
        }));

        return true;
      },

      getReplyCount: (threadId: string) => {
        const { repliesByThread } = get();
        return (repliesByThread[threadId] || []).length;
      },
    }),
    {
      name: 'pokemon-tcg-replies',
      partialize: (state) => ({
        repliesByThread: state.repliesByThread,
      }),
    }
  )
);

// Export helper functions
export function getRepliesByThread(threadId: string): Reply[] {
  return useReplyStore.getState().getRepliesByThread(threadId);
}

export function getReplyCount(threadId: string): number {
  return useReplyStore.getState().getReplyCount(threadId);
}
