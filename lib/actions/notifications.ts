'use server';

import { createClient } from '@/lib/supabase/server';
// Import types from separate file (Next.js 15/16 'use server' files can only export async functions)
import type { NotificationResult, Notification } from './action-types';

// Re-export types for consumers
export type { NotificationResult, Notification } from './action-types';

/**
 * Create a new notification for a user
 * This function is called internally by other actions to trigger notifications
 */
export async function createNotification(
  userId: string,
  actorId: string | null,
  type: 'reply' | 'mention' | 'like' | 'follow' | 'badge',
  message: string,
  link: string | null = null
): Promise<NotificationResult> {
  try {
    const supabase = await createClient();

    // Validate inputs
    if (!userId) {
      console.error('[createNotification] Missing userId');
      return { success: false, error: 'User ID is required' };
    }

    if (!type) {
      console.error('[createNotification] Missing type');
      return { success: false, error: 'Notification type is required' };
    }

    if (!message) {
      console.error('[createNotification] Missing message');
      return { success: false, error: 'Notification message is required' };
    }

    // Validate notification type
    const validTypes = ['reply', 'mention', 'like', 'follow', 'badge'];
    if (!validTypes.includes(type)) {
      console.error('[createNotification] Invalid type:', type);
      return { success: false, error: 'Invalid notification type' };
    }

    // Don't create notification if actor is the same as recipient (user liking their own post)
    if (actorId && actorId === userId) {
      console.log('[createNotification] Skipping self-notification');
      return { success: true };
    }

    // Create the notification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('notifications')
      .insert({
        user_id: userId,
        actor_id: actorId,
        type,
        message,
        link,
        is_read: false,
      })
      .select('id')
      .single() as { data: { id: string } | null; error: Error | null };

    if (error) {
      console.error('[createNotification] Database error:', error);
      return { success: false, error: 'Failed to create notification' };
    }

    console.log('[createNotification] Success:', { notificationId: data?.id, type, userId });
    return { success: true, notificationId: data?.id };
  } catch (error) {
    console.error('[createNotification] Unexpected error:', error);
    // Don't throw error - notification failures shouldn't break the main action
    return { success: false, error: 'Unexpected error creating notification' };
  }
}

/**
 * Get notifications for the current user
 */
export async function getUserNotifications(limit: number = 50): Promise<Notification[]> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('[getUserNotifications] User not authenticated');
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('notifications')
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100)) as { data: Notification[] | null; error: Error | null };

    if (error) {
      console.error('[getUserNotifications] Database error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[getUserNotifications] Unexpected error:', error);
    return [];
  }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId: string): Promise<NotificationResult> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'You must be logged in' };
    }

    if (!notificationId) {
      return { success: false, error: 'Notification ID is required' };
    }

    // Verify ownership and mark as read
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('[markAsRead] Database error:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }

    return { success: true, notificationId };
  } catch (error) {
    console.error('[markAsRead] Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead(): Promise<NotificationResult> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'You must be logged in' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('[markAllAsRead] Database error:', error);
      return { success: false, error: 'Failed to mark all notifications as read' };
    }

    return { success: true };
  } catch (error) {
    console.error('[markAllAsRead] Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<NotificationResult> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'You must be logged in' };
    }

    if (!notificationId) {
      return { success: false, error: 'Notification ID is required' };
    }

    // Verify ownership and delete
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('[deleteNotification] Database error:', error);
      return { success: false, error: 'Failed to delete notification' };
    }

    return { success: true };
  } catch (error) {
    console.error('[deleteNotification] Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Get count of unread notifications for the current user
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('[getUnreadCount] Database error:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('[getUnreadCount] Unexpected error:', error);
    return 0;
  }
}
