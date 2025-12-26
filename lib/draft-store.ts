import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReplyImage } from './reply-store';

export interface Draft {
  content: string;
  images?: ReplyImage[];
  updatedAt: string;
}

interface DraftState {
  // Drafts keyed by a unique identifier (threadId or threadId-parentReplyId)
  drafts: Record<string, Draft>;

  // Actions
  saveDraft: (key: string, content: string, images?: ReplyImage[]) => void;
  getDraft: (key: string) => Draft | null;
  clearDraft: (key: string) => void;
  clearAllDrafts: () => void;
  hasDraft: (key: string) => boolean;
  getDraftAge: (key: string) => number | null; // Returns age in milliseconds
}

// Generate a unique key for a draft
export function getDraftKey(threadId: string, parentReplyId?: string): string {
  if (parentReplyId) {
    return `thread-${threadId}-reply-${parentReplyId}`;
  }
  return `thread-${threadId}`;
}

// Auto-save debounce delay in milliseconds
export const DRAFT_SAVE_DELAY = 1000;

// Draft expiration time (7 days in milliseconds)
export const DRAFT_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      drafts: {},

      saveDraft: (key: string, content: string, images?: ReplyImage[]) => {
        // Don't save empty drafts
        if (!content.trim() && (!images || images.length === 0)) {
          // If draft exists and content is now empty, clear it
          const { drafts } = get();
          if (drafts[key]) {
            const { [key]: _, ...rest } = drafts;
            set({ drafts: rest });
          }
          return;
        }

        set(state => ({
          drafts: {
            ...state.drafts,
            [key]: {
              content,
              images,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      getDraft: (key: string) => {
        const { drafts } = get();
        const draft = drafts[key];

        if (!draft) return null;

        // Check if draft has expired (but don't call set() here - that causes infinite loops!)
        const age = Date.now() - new Date(draft.updatedAt).getTime();
        if (age > DRAFT_EXPIRATION) {
          // Return null for expired drafts - cleanup happens on rehydration or when saving
          return null;
        }

        return draft;
      },

      clearDraft: (key: string) => {
        set(state => {
          const { [key]: _, ...rest } = state.drafts;
          return { drafts: rest };
        });
      },

      clearAllDrafts: () => {
        set({ drafts: {} });
      },

      hasDraft: (key: string): boolean => {
        const draft = get().getDraft(key);
        if (!draft) return false;
        return draft.content.trim().length > 0 || (draft.images !== undefined && draft.images.length > 0);
      },

      getDraftAge: (key: string) => {
        const { drafts } = get();
        const draft = drafts[key];
        if (!draft) return null;
        return Date.now() - new Date(draft.updatedAt).getTime();
      },
    }),
    {
      name: 'tcg-forum-drafts',
      // Clean up expired drafts on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          const now = Date.now();
          const validDrafts: Record<string, Draft> = {};

          for (const [key, draft] of Object.entries(state.drafts)) {
            const age = now - new Date(draft.updatedAt).getTime();
            if (age <= DRAFT_EXPIRATION) {
              validDrafts[key] = draft;
            }
          }

          state.drafts = validDrafts;
        }
      },
    }
  )
);

// Hook for using drafts with a specific thread/reply
export function useThreadDraft(threadId: string, parentReplyId?: string) {
  const key = getDraftKey(threadId, parentReplyId);

  // Use selectors to avoid calling functions during render
  const draft = useDraftStore((state) => {
    const d = state.drafts[key];
    if (!d) return null;
    // Check expiration without calling set()
    const age = Date.now() - new Date(d.updatedAt).getTime();
    if (age > DRAFT_EXPIRATION) return null;
    return d;
  });

  const draftAge = useDraftStore((state) => {
    const d = state.drafts[key];
    if (!d) return null;
    return Date.now() - new Date(d.updatedAt).getTime();
  });

  const saveDraft = useDraftStore((state) => state.saveDraft);
  const clearDraft = useDraftStore((state) => state.clearDraft);

  return {
    key,
    draft,
    hasDraft: draft !== null && (draft.content.trim().length > 0 || (draft.images !== undefined && draft.images.length > 0)),
    draftAge,
    save: (content: string, images?: ReplyImage[]) => saveDraft(key, content, images),
    clear: () => clearDraft(key),
  };
}

// Format draft age for display
export function formatDraftAge(ageMs: number): string {
  const seconds = Math.floor(ageMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
