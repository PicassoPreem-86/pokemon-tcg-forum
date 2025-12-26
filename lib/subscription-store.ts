import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Subscription data for a watched thread
 */
export interface ThreadSubscription {
  threadId: string;
  threadSlug: string;
  threadTitle: string;
  categoryId: string;
  subscribedAt: string;
  // Notification preferences for this subscription
  notifyOnReply: boolean;
  notifyOnMention: boolean;
  // Auto-subscribed (from replying) vs manual subscription
  isAutoSubscribed: boolean;
}

/**
 * Subscription store state
 */
interface SubscriptionState {
  // Map of threadId -> subscription data
  subscriptions: Record<string, ThreadSubscription>;

  // Actions
  subscribe: (thread: {
    id: string;
    slug: string;
    title: string;
    categoryId: string;
  }, options?: {
    isAutoSubscribed?: boolean;
    notifyOnReply?: boolean;
    notifyOnMention?: boolean;
  }) => void;

  unsubscribe: (threadId: string) => void;

  toggleSubscription: (thread: {
    id: string;
    slug: string;
    title: string;
    categoryId: string;
  }) => boolean; // Returns new subscription state

  updateSubscriptionSettings: (threadId: string, settings: {
    notifyOnReply?: boolean;
    notifyOnMention?: boolean;
  }) => void;

  // Queries
  isSubscribed: (threadId: string) => boolean;
  getSubscription: (threadId: string) => ThreadSubscription | undefined;
  getSubscribedThreadIds: () => string[];
  getSubscriptionCount: () => number;
  getAllSubscriptions: () => ThreadSubscription[];
  getSubscriptionsByCategory: (categoryId: string) => ThreadSubscription[];

  // Bulk actions
  unsubscribeAll: () => void;
  unsubscribeByCategory: (categoryId: string) => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: {},

      /**
       * Subscribe to a thread
       */
      subscribe: (thread, options = {}) => {
        const {
          isAutoSubscribed = false,
          notifyOnReply = true,
          notifyOnMention = true,
        } = options;

        set(state => ({
          subscriptions: {
            ...state.subscriptions,
            [thread.id]: {
              threadId: thread.id,
              threadSlug: thread.slug,
              threadTitle: thread.title,
              categoryId: thread.categoryId,
              subscribedAt: new Date().toISOString(),
              notifyOnReply,
              notifyOnMention,
              isAutoSubscribed,
            },
          },
        }));
      },

      /**
       * Unsubscribe from a thread
       */
      unsubscribe: (threadId: string) => {
        set(state => {
          const { [threadId]: removed, ...rest } = state.subscriptions;
          return { subscriptions: rest };
        });
      },

      /**
       * Toggle subscription status - returns new state (true = now subscribed)
       */
      toggleSubscription: (thread) => {
        const { subscriptions } = get();
        const isCurrentlySubscribed = thread.id in subscriptions;

        if (isCurrentlySubscribed) {
          get().unsubscribe(thread.id);
          return false;
        } else {
          get().subscribe(thread, { isAutoSubscribed: false });
          return true;
        }
      },

      /**
       * Update notification settings for a subscription
       */
      updateSubscriptionSettings: (threadId, settings) => {
        set(state => {
          const subscription = state.subscriptions[threadId];
          if (!subscription) return state;

          return {
            subscriptions: {
              ...state.subscriptions,
              [threadId]: {
                ...subscription,
                ...settings,
              },
            },
          };
        });
      },

      /**
       * Check if subscribed to a thread
       */
      isSubscribed: (threadId: string) => {
        return threadId in get().subscriptions;
      },

      /**
       * Get subscription data for a thread
       */
      getSubscription: (threadId: string) => {
        return get().subscriptions[threadId];
      },

      /**
       * Get all subscribed thread IDs
       */
      getSubscribedThreadIds: () => {
        return Object.keys(get().subscriptions);
      },

      /**
       * Get total subscription count
       */
      getSubscriptionCount: () => {
        return Object.keys(get().subscriptions).length;
      },

      /**
       * Get all subscriptions as array, sorted by most recent
       */
      getAllSubscriptions: () => {
        return Object.values(get().subscriptions).sort(
          (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
        );
      },

      /**
       * Get subscriptions for a specific category
       */
      getSubscriptionsByCategory: (categoryId: string) => {
        return Object.values(get().subscriptions)
          .filter(sub => sub.categoryId === categoryId)
          .sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
      },

      /**
       * Unsubscribe from all threads
       */
      unsubscribeAll: () => {
        set({ subscriptions: {} });
      },

      /**
       * Unsubscribe from all threads in a category
       */
      unsubscribeByCategory: (categoryId: string) => {
        set(state => {
          const filtered = Object.entries(state.subscriptions)
            .filter(([_, sub]) => sub.categoryId !== categoryId)
            .reduce((acc, [id, sub]) => ({ ...acc, [id]: sub }), {});
          return { subscriptions: filtered };
        });
      },
    }),
    {
      name: 'tcg-forum-subscriptions',
      partialize: (state) => ({
        subscriptions: state.subscriptions,
      }),
    }
  )
);

/**
 * Hook to get subscription status for a specific thread
 */
export function useThreadSubscription(threadId: string) {
  const isSubscribed = useSubscriptionStore(state => state.isSubscribed(threadId));
  const subscription = useSubscriptionStore(state => state.getSubscription(threadId));
  const subscribe = useSubscriptionStore(state => state.subscribe);
  const unsubscribe = useSubscriptionStore(state => state.unsubscribe);
  const toggleSubscription = useSubscriptionStore(state => state.toggleSubscription);

  return {
    isSubscribed,
    subscription,
    subscribe,
    unsubscribe,
    toggleSubscription,
  };
}

/**
 * Hook to get all subscriptions with unread integration
 */
export function useSubscriptionsWithUnread() {
  const subscriptions = useSubscriptionStore(state => state.getAllSubscriptions());
  return subscriptions;
}
