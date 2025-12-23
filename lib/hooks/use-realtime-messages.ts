'use client';

import { useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface RealtimeDirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  deleted_at: string | null;
  created_at: string;
}

interface UseRealtimeMessagesOptions {
  /** Called when a new message is inserted */
  onInsert?: (message: RealtimeDirectMessage) => void;
  /** Called when a message is updated (e.g., marked as read) */
  onUpdate?: (message: RealtimeDirectMessage) => void;
  /** Called when a message is deleted */
  onDelete?: (oldMessage: { id: string }) => void;
  /** Whether to enable the subscription */
  enabled?: boolean;
}

/**
 * Hook to subscribe to real-time direct message updates for a conversation
 *
 * @param conversationId - The conversation ID to subscribe to
 * @param options - Callback options for insert/update/delete events
 * @returns Object with subscription status
 */
export function useRealtimeMessages(
  conversationId: string | undefined,
  options: UseRealtimeMessagesOptions = {}
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
    // Don't subscribe if no conversation ID or disabled
    if (!conversationId || !enabled) {
      return;
    }

    // Avoid duplicate subscriptions
    if (isSubscribedRef.current) {
      return;
    }

    const supabase = getSupabaseClient();

    // Create a unique channel name for this conversation's messages
    const channelName = `messages:${conversationId}`;

    // Subscribe to changes on the direct_messages table for this conversation
    const channel = supabase
      .channel(channelName)
      .on<RealtimeDirectMessage>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<RealtimeDirectMessage>) => {
          if (payload.new && onInsertRef.current) {
            onInsertRef.current(payload.new as RealtimeDirectMessage);
          }
        }
      )
      .on<RealtimeDirectMessage>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<RealtimeDirectMessage>) => {
          if (payload.new && onUpdateRef.current) {
            onUpdateRef.current(payload.new as RealtimeDirectMessage);
          }
        }
      )
      .on<RealtimeDirectMessage>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<RealtimeDirectMessage>) => {
          if (payload.old && onDeleteRef.current) {
            onDeleteRef.current({ id: (payload.old as RealtimeDirectMessage).id });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          console.log('[Realtime] Subscribed to messages:', conversationId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error for messages');
          isSubscribedRef.current = false;
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount or when conversationId changes
    return () => {
      if (channelRef.current) {
        console.log('[Realtime] Unsubscribing from messages');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [conversationId, enabled]);

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

export default useRealtimeMessages;
