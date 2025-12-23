'use client';

import { useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface RealtimeNotification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'reply' | 'mention' | 'like' | 'follow' | 'badge';
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface UseRealtimeNotificationsOptions {
  /** Called when a new notification is inserted */
  onInsert?: (notification: RealtimeNotification) => void;
  /** Called when a notification is updated (e.g., marked as read) */
  onUpdate?: (notification: RealtimeNotification) => void;
  /** Called when a notification is deleted */
  onDelete?: (oldNotification: { id: string }) => void;
  /** Whether to enable the subscription */
  enabled?: boolean;
}

/**
 * Hook to subscribe to real-time notification updates via Supabase Realtime
 *
 * @param userId - The user ID to subscribe to notifications for
 * @param options - Callback options for insert/update/delete events
 * @returns Object with subscription status
 */
export function useRealtimeNotifications(
  userId: string | undefined,
  options: UseRealtimeNotificationsOptions = {}
) {
  const { onInsert, onUpdate, onDelete, enabled = true } = options;
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);

  // Stable callback refs to avoid re-subscriptions
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);

  useEffect(() => {
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
  }, [onInsert, onUpdate, onDelete]);

  useEffect(() => {
    // Don't subscribe if no user ID or disabled
    if (!userId || !enabled) {
      return;
    }

    // Avoid duplicate subscriptions
    if (isSubscribedRef.current) {
      return;
    }

    const supabase = getSupabaseClient();

    // Create a unique channel name for this user's notifications
    const channelName = `notifications:${userId}`;

    // Subscribe to changes on the notifications table for this user
    const channel = supabase
      .channel(channelName)
      .on<RealtimeNotification>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<RealtimeNotification>) => {
          if (payload.new && onInsertRef.current) {
            onInsertRef.current(payload.new as RealtimeNotification);
          }
        }
      )
      .on<RealtimeNotification>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<RealtimeNotification>) => {
          if (payload.new && onUpdateRef.current) {
            onUpdateRef.current(payload.new as RealtimeNotification);
          }
        }
      )
      .on<RealtimeNotification>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<RealtimeNotification>) => {
          if (payload.old && onDeleteRef.current) {
            onDeleteRef.current({ id: (payload.old as RealtimeNotification).id });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          console.log('[Realtime] Subscribed to notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error for notifications');
          isSubscribedRef.current = false;
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount or when userId changes
    return () => {
      if (channelRef.current) {
        console.log('[Realtime] Unsubscribing from notifications');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [userId, enabled]);

  // Manual unsubscribe function
  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      const supabase = getSupabaseClient();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  }, []);

  return {
    isSubscribed: isSubscribedRef.current,
    unsubscribe,
  };
}

export default useRealtimeNotifications;
