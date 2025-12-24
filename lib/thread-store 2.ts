import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Thread } from './types';
import { MOCK_THREADS } from './mock-data/threads';
import { useAuthStore } from './auth-store';

// Thread creation data
export interface CreateThreadData {
  title: string;
  content: string;
  categoryId: string;
  tags?: string[];
}

// Extended thread with full content for user-created threads
export interface UserThread extends Thread {
  content: string; // Full post content
}

// Thread edit data
export interface EditThreadData {
  title: string;
  content: string;
  tags?: string[];
}

// Thread store state
interface ThreadState {
  // User-created threads stored separately from mock data
  userThreads: UserThread[];

  // Actions
  createThread: (data: CreateThreadData) => UserThread | null;
  getThreadById: (id: string) => (Thread | UserThread) | undefined;
  getThreadBySlug: (slug: string) => (Thread | UserThread) | undefined;
  getThreadsByCategory: (categoryId: string) => (Thread | UserThread)[];
  getAllThreads: () => (Thread | UserThread)[];
  getRecentThreads: (limit?: number) => (Thread | UserThread)[];
  incrementViewCount: (threadId: string) => void;
  editThread: (threadId: string, data: EditThreadData) => boolean;
  deleteThread: (threadId: string) => boolean;
  getThreadContent: (threadId: string) => string | undefined;
}

// Generate unique thread ID
function generateThreadId(): string {
  return `thread-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');
}

// Create the thread store
export const useThreadStore = create<ThreadState>()(
  persist(
    (set, get) => ({
      userThreads: [],

      createThread: (data: CreateThreadData) => {
        // Get current user from auth store
        const authState = useAuthStore.getState();
        const user = authState.user;

        if (!user) {
          console.error('Must be logged in to create a thread');
          return null;
        }

        // Validate data
        if (!data.title.trim() || data.title.trim().length < 10) {
          console.error('Title must be at least 10 characters');
          return null;
        }

        if (!data.content.trim() || data.content.trim().length < 20) {
          console.error('Content must be at least 20 characters');
          return null;
        }

        if (!data.categoryId) {
          console.error('Category is required');
          return null;
        }

        const now = new Date().toISOString();
        const threadId = generateThreadId();
        const slug = generateSlug(data.title) + '-' + threadId.slice(-6);

        const newThread: UserThread = {
          id: threadId,
          slug,
          title: data.title.trim(),
          categoryId: data.categoryId,
          authorId: user.id,
          author: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar || '/images/avatars/default.png',
            role: user.role,
            joinDate: user.joinDate,
            postCount: user.postCount,
            reputation: user.reputation,
            location: user.location,
            signature: user.bio,
          },
          createdAt: now,
          updatedAt: now,
          postCount: 1, // Original post counts as 1
          viewCount: 0,
          isPinned: false,
          isLocked: false,
          isHot: false,
          tags: data.tags || [],
          excerpt: data.content.trim().substring(0, 200) + (data.content.length > 200 ? '...' : ''),
          content: data.content.trim(), // Store full content
        };

        // Add to user threads
        set((state) => ({
          userThreads: [newThread, ...state.userThreads],
        }));

        // Update user's post count in auth store
        useAuthStore.getState().updateProfile({
          postCount: (user.postCount || 0) + 1,
        });

        return newThread;
      },

      getThreadById: (id: string) => {
        const { userThreads } = get();

        // Check user threads first
        const userThread = userThreads.find((t) => t.id === id);
        if (userThread) return userThread;

        // Fall back to mock threads
        return MOCK_THREADS.find((t) => t.id === id);
      },

      getThreadBySlug: (slug: string) => {
        const { userThreads } = get();

        // Check user threads first
        const userThread = userThreads.find((t) => t.slug === slug);
        if (userThread) return userThread;

        // Fall back to mock threads
        return MOCK_THREADS.find((t) => t.slug === slug);
      },

      getThreadsByCategory: (categoryId: string) => {
        const { userThreads } = get();

        // Combine user threads and mock threads
        const userCategoryThreads = userThreads.filter((t) => t.categoryId === categoryId);
        const mockCategoryThreads = MOCK_THREADS.filter((t) => t.categoryId === categoryId);

        // Merge and sort by updatedAt (most recent first)
        return [...userCategoryThreads, ...mockCategoryThreads].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      },

      getAllThreads: () => {
        const { userThreads } = get();

        // Combine and sort
        return [...userThreads, ...MOCK_THREADS].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      },

      getRecentThreads: (limit: number = 10) => {
        const { userThreads } = get();

        // Combine, sort, and limit
        return [...userThreads, ...MOCK_THREADS]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit);
      },

      incrementViewCount: (threadId: string) => {
        set((state) => ({
          userThreads: state.userThreads.map((thread) =>
            thread.id === threadId
              ? { ...thread, viewCount: thread.viewCount + 1 }
              : thread
          ),
        }));
      },

      editThread: (threadId: string, data: EditThreadData) => {
        const { userThreads } = get();
        const authState = useAuthStore.getState();
        const user = authState.user;

        // Find the thread
        const thread = userThreads.find((t) => t.id === threadId);
        if (!thread) return false;

        // Check if user owns the thread or is admin/mod
        if (!user || (thread.authorId !== user.id && user.role !== 'admin' && user.role !== 'moderator')) {
          return false;
        }

        // Validate data
        if (!data.title.trim() || data.title.trim().length < 10) {
          console.error('Title must be at least 10 characters');
          return false;
        }

        if (!data.content.trim() || data.content.trim().length < 20) {
          console.error('Content must be at least 20 characters');
          return false;
        }

        const now = new Date().toISOString();

        set((state) => ({
          userThreads: state.userThreads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  title: data.title.trim(),
                  content: data.content.trim(),
                  excerpt: data.content.trim().substring(0, 200) + (data.content.length > 200 ? '...' : ''),
                  tags: data.tags || t.tags,
                  updatedAt: now,
                }
              : t
          ),
        }));

        return true;
      },

      deleteThread: (threadId: string) => {
        const { userThreads } = get();
        const authState = useAuthStore.getState();
        const user = authState.user;

        // Find the thread
        const thread = userThreads.find((t) => t.id === threadId);
        if (!thread) return false;

        // Check if user owns the thread or is admin/mod
        if (user && (thread.authorId === user.id || user.role === 'admin' || user.role === 'moderator')) {
          set((state) => ({
            userThreads: state.userThreads.filter((t) => t.id !== threadId),
          }));
          return true;
        }

        return false;
      },

      getThreadContent: (threadId: string) => {
        const { userThreads } = get();
        const thread = userThreads.find((t) => t.id === threadId);
        return thread?.content;
      },
    }),
    {
      name: 'pokemon-tcg-threads',
      partialize: (state) => ({
        userThreads: state.userThreads,
      }),
    }
  )
);

// Export helper functions that combine user and mock threads
export function getAllThreads(): (Thread | UserThread)[] {
  return useThreadStore.getState().getAllThreads();
}

export function getThreadsByCategory(categoryId: string): (Thread | UserThread)[] {
  return useThreadStore.getState().getThreadsByCategory(categoryId);
}

export function getThreadBySlug(slug: string): (Thread | UserThread) | undefined {
  return useThreadStore.getState().getThreadBySlug(slug);
}

export function getThreadById(id: string): (Thread | UserThread) | undefined {
  return useThreadStore.getState().getThreadById(id);
}

export function getRecentThreads(limit?: number): (Thread | UserThread)[] {
  return useThreadStore.getState().getRecentThreads(limit);
}

export function getThreadContent(threadId: string): string | undefined {
  return useThreadStore.getState().getThreadContent(threadId);
}

// Type guard to check if thread has content (is a UserThread)
export function isUserThread(thread: Thread | UserThread | null | undefined): thread is UserThread {
  return thread != null && 'content' in thread;
}
