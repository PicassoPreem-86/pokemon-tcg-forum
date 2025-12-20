'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  withAdminAuth,
  type AdminActionResult,
} from '@/lib/auth/admin-check';
import { checkRateLimit } from '@/lib/auth/utils';
import { logModerationAction } from './moderation-log';
import type { UserRole } from '@/lib/supabase/database.types';

// Helper types for Supabase query results with partial selects
type QueryError = { message: string; code?: string } | null;

type UserBanQueryResult = {
  role: UserRole;
  username: string;
  is_banned: boolean;
};

type UserSuspendQueryResult = {
  role: UserRole;
  username: string;
  is_suspended: boolean;
};

type UserUnbanQueryResult = {
  username: string;
  is_banned: boolean;
};

type UserUnsuspendQueryResult = {
  username: string;
  is_suspended: boolean;
};

type ThreadDeleteQueryResult = {
  id: string;
  title: string;
  author_id: string;
  deleted_at: string | null;
};

type ReplyDeleteQueryResult = {
  id: string;
  thread_id: string;
  author_id: string;
  deleted_at: string | null;
};

type ThreadLockQueryResult = {
  id: string;
  title: string;
  is_locked: boolean;
};

type ThreadPinQueryResult = {
  id: string;
  title: string;
  is_pinned: boolean;
};

// Re-export types for consumers
export type {
  UserModerationData,
  ThreadModerationData,
  ReplyModerationData,
} from './action-types';

/**
 * Ban a user (permanent or temporary)
 *
 * @param userId - The ID of the user to ban
 * @param reason - The reason for the ban
 * @param duration - Optional duration in days (null for permanent ban)
 * @returns AdminActionResult<void>
 */
export async function banUser(
  userId: string,
  reason: string,
  duration?: number
): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting - max 5 bans per minute per moderator
    if (!checkRateLimit(`ban-user-${adminProfile.id}`, 5, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before banning more users.');
    }

    // Validation
    if (!reason || reason.trim().length === 0) {
      throw new Error('A reason for the ban must be provided');
    }

    if (reason.length > 500) {
      throw new Error('Ban reason must be 500 characters or less');
    }

    // Security: Cannot ban self
    if (userId === adminProfile.id) {
      throw new Error('You cannot ban your own account');
    }

    // Get target user to verify role hierarchy
    const { data: targetUser, error: fetchError } = await supabase
      .from('profiles')
      .select('role, username, is_banned')
      .eq('id', userId)
      .single() as { data: UserBanQueryResult | null; error: QueryError };

    if (fetchError || !targetUser) {
      throw new Error('User not found');
    }

    // Check if already banned
    if (targetUser.is_banned) {
      throw new Error('User is already banned');
    }

    // Role hierarchy check
    if (targetUser.role === 'moderator' && adminProfile.role !== 'admin') {
      throw new Error('Only administrators can ban moderators');
    }

    if (targetUser.role === 'admin') {
      throw new Error('Cannot ban administrator accounts');
    }

    // Calculate ban expiration if temporary
    const bannedUntil = duration
      ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Update user profile with ban information
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        banned_reason: reason,
        banned_until: bannedUntil,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to ban user: ${updateError.message}`);
    }

    // Log the moderation action
    await logModerationAction(
      'ban_user',
      userId,
      'user',
      reason,
      adminProfile,
      {
        username: targetUser.username,
        duration: duration || 'permanent',
        banned_until: bannedUntil,
      }
    );

    revalidatePath('/admin/users');
    revalidatePath(`/profile/${targetUser.username}`);
  });
}

/**
 * Unban a user
 *
 * @param userId - The ID of the user to unban
 * @returns AdminActionResult<void>
 */
export async function unbanUser(userId: string): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`unban-user-${adminProfile.id}`, 10, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before unbanning more users.');
    }

    // Get target user
    const { data: targetUser, error: fetchError } = await supabase
      .from('profiles')
      .select('username, is_banned')
      .eq('id', userId)
      .single() as { data: UserUnbanQueryResult | null; error: QueryError };

    if (fetchError || !targetUser) {
      throw new Error('User not found');
    }

    if (!targetUser.is_banned) {
      throw new Error('User is not currently banned');
    }

    // Remove ban
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update({
        is_banned: false,
        banned_at: null,
        banned_reason: null,
        banned_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to unban user: ${updateError.message}`);
    }

    // Log the moderation action
    await logModerationAction(
      'unban_user',
      userId,
      'user',
      'Ban removed',
      adminProfile,
      { username: targetUser.username }
    );

    revalidatePath('/admin/users');
    revalidatePath(`/profile/${targetUser.username}`);
  });
}

/**
 * Suspend a user temporarily
 *
 * @param userId - The ID of the user to suspend
 * @param reason - The reason for the suspension
 * @param days - Number of days to suspend (required)
 * @returns AdminActionResult<void>
 */
export async function suspendUser(
  userId: string,
  reason: string,
  days: number
): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`suspend-user-${adminProfile.id}`, 10, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before suspending more users.');
    }

    // Validation
    if (!reason || reason.trim().length === 0) {
      throw new Error('A reason for the suspension must be provided');
    }

    if (!days || days < 1 || days > 365) {
      throw new Error('Suspension duration must be between 1 and 365 days');
    }

    // Security: Cannot suspend self
    if (userId === adminProfile.id) {
      throw new Error('You cannot suspend your own account');
    }

    // Get target user
    const { data: targetUser, error: fetchError } = await supabase
      .from('profiles')
      .select('role, username, is_suspended')
      .eq('id', userId)
      .single() as { data: UserSuspendQueryResult | null; error: QueryError };

    if (fetchError || !targetUser) {
      throw new Error('User not found');
    }

    if (targetUser.is_suspended) {
      throw new Error('User is already suspended');
    }

    // Role hierarchy check
    if (targetUser.role === 'moderator' && adminProfile.role !== 'admin') {
      throw new Error('Only administrators can suspend moderators');
    }

    if (targetUser.role === 'admin') {
      throw new Error('Cannot suspend administrator accounts');
    }

    // Calculate suspension expiration
    const suspendedUntil = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    ).toISOString();

    // Update user profile with suspension information
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update({
        is_suspended: true,
        suspended_at: new Date().toISOString(),
        suspended_reason: reason,
        suspended_until: suspendedUntil,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to suspend user: ${updateError.message}`);
    }

    // Log the moderation action
    await logModerationAction(
      'suspend_user',
      userId,
      'user',
      reason,
      adminProfile,
      {
        username: targetUser.username,
        days,
        suspended_until: suspendedUntil,
      }
    );

    revalidatePath('/admin/users');
    revalidatePath(`/profile/${targetUser.username}`);
  });
}

/**
 * Unsuspend a user
 *
 * @param userId - The ID of the user to unsuspend
 * @returns AdminActionResult<void>
 */
export async function unsuspendUser(userId: string): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`unsuspend-user-${adminProfile.id}`, 10, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before unsuspending more users.');
    }

    // Get target user
    const { data: targetUser, error: fetchError } = await supabase
      .from('profiles')
      .select('username, is_suspended')
      .eq('id', userId)
      .single() as { data: UserUnsuspendQueryResult | null; error: QueryError };

    if (fetchError || !targetUser) {
      throw new Error('User not found');
    }

    if (!targetUser.is_suspended) {
      throw new Error('User is not currently suspended');
    }

    // Remove suspension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update({
        is_suspended: false,
        suspended_at: null,
        suspended_reason: null,
        suspended_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to unsuspend user: ${updateError.message}`);
    }

    // Log the moderation action
    await logModerationAction(
      'unsuspend_user',
      userId,
      'user',
      'Suspension removed',
      adminProfile,
      { username: targetUser.username }
    );

    revalidatePath('/admin/users');
    revalidatePath(`/profile/${targetUser.username}`);
  });
}

/**
 * Delete a thread (admin override)
 *
 * @param threadId - The ID of the thread to delete
 * @param reason - The reason for deletion
 * @returns AdminActionResult<void>
 */
export async function deleteThread(
  threadId: string,
  reason: string
): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`delete-thread-${adminProfile.id}`, 20, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before deleting more threads.');
    }

    // Validation
    if (!reason || reason.trim().length === 0) {
      throw new Error('A reason for the deletion must be provided');
    }

    // Get thread to verify it exists
    const { data: thread, error: fetchError } = await supabase
      .from('threads')
      .select('id, title, author_id, deleted_at')
      .eq('id', threadId)
      .single() as { data: ThreadDeleteQueryResult | null; error: QueryError };

    if (fetchError || !thread) {
      throw new Error('Thread not found');
    }

    if (thread.deleted_at) {
      throw new Error('Thread is already deleted');
    }

    // Soft delete - mark as deleted instead of removing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error: updateError } = await (supabase as any)
      .from('threads')
      .update({
        deleted_by: adminProfile.id,
        deleted_at: new Date().toISOString(),
        deleted_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', threadId);

    if (updateError) {
      throw new Error(`Failed to delete thread: ${updateError.message}`);
    }

    // Log the moderation action
    await logModerationAction(
      'delete_thread',
      threadId,
      'thread',
      reason,
      adminProfile,
      { title: thread.title }
    );

    revalidatePath('/admin/content');
    revalidatePath('/');
  });
}

/**
 * Delete a reply (admin override)
 *
 * @param replyId - The ID of the reply to delete
 * @param reason - The reason for deletion
 * @returns AdminActionResult<void>
 */
export async function deleteReply(
  replyId: string,
  reason: string
): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`delete-reply-${adminProfile.id}`, 30, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before deleting more replies.');
    }

    // Validation
    if (!reason || reason.trim().length === 0) {
      throw new Error('A reason for the deletion must be provided');
    }

    // Get reply to verify it exists
    const { data: reply, error: fetchError } = await supabase
      .from('replies')
      .select('id, thread_id, author_id, deleted_at')
      .eq('id', replyId)
      .single() as { data: ReplyDeleteQueryResult | null; error: QueryError };

    if (fetchError || !reply) {
      throw new Error('Reply not found');
    }

    if (reply.deleted_at) {
      throw new Error('Reply is already deleted');
    }

    // Soft delete - mark as deleted instead of removing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error: updateError } = await (supabase as any)
      .from('replies')
      .update({
        deleted_by: adminProfile.id,
        deleted_at: new Date().toISOString(),
        deleted_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', replyId);

    if (updateError) {
      throw new Error(`Failed to delete reply: ${updateError.message}`);
    }

    // Log the moderation action
    await logModerationAction(
      'delete_reply',
      replyId,
      'reply',
      reason,
      adminProfile,
      { thread_id: reply.thread_id }
    );

    revalidatePath('/admin/content');
  });
}

/**
 * Lock a thread to prevent new replies
 *
 * @param threadId - The ID of the thread to lock
 * @returns AdminActionResult<void>
 */
export async function lockThread(threadId: string): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`lock-thread-${adminProfile.id}`, 20, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before locking more threads.');
    }

    // Get thread
    const { data: thread, error: fetchError } = await supabase
      .from('threads')
      .select('id, title, is_locked')
      .eq('id', threadId)
      .single() as { data: ThreadLockQueryResult | null; error: QueryError };

    if (fetchError || !thread) {
      throw new Error('Thread not found');
    }

    if (thread.is_locked) {
      throw new Error('Thread is already locked');
    }

    // Lock thread
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error: updateError } = await (supabase as any)
      .from('threads')
      .update({
        is_locked: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', threadId);

    if (updateError) {
      throw new Error(`Failed to lock thread: ${updateError.message}`);
    }

    // Log the moderation action
    await logModerationAction(
      'lock_thread',
      threadId,
      'thread',
      'Thread locked',
      adminProfile,
      { title: thread.title }
    );

    revalidatePath('/admin/content');
    revalidatePath('/');
  });
}

/**
 * Unlock a thread to allow new replies
 *
 * @param threadId - The ID of the thread to unlock
 * @returns AdminActionResult<void>
 */
export async function unlockThread(threadId: string): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`unlock-thread-${adminProfile.id}`, 20, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before unlocking more threads.');
    }

    // Get thread
    const { data: thread, error: fetchError } = await supabase
      .from('threads')
      .select('id, title, is_locked')
      .eq('id', threadId)
      .single() as { data: ThreadLockQueryResult | null; error: QueryError };

    if (fetchError || !thread) {
      throw new Error('Thread not found');
    }

    if (!thread.is_locked) {
      throw new Error('Thread is not locked');
    }

    // Unlock thread
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error: updateError } = await (supabase as any)
      .from('threads')
      .update({
        is_locked: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', threadId);

    if (updateError) {
      throw new Error(`Failed to unlock thread: ${updateError.message}`);
    }

    // Log the moderation action
    await logModerationAction(
      'unlock_thread',
      threadId,
      'thread',
      'Thread unlocked',
      adminProfile,
      { title: thread.title }
    );

    revalidatePath('/admin/content');
    revalidatePath('/');
  });
}

/**
 * Pin a thread to the top of the category
 *
 * @param threadId - The ID of the thread to pin
 * @returns AdminActionResult<void>
 */
export async function pinThread(threadId: string): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`pin-thread-${adminProfile.id}`, 20, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before pinning more threads.');
    }

    // Get thread
    const { data: thread, error: fetchError } = await supabase
      .from('threads')
      .select('id, title, is_pinned')
      .eq('id', threadId)
      .single() as { data: ThreadPinQueryResult | null; error: QueryError };

    if (fetchError || !thread) {
      throw new Error('Thread not found');
    }

    if (thread.is_pinned) {
      throw new Error('Thread is already pinned');
    }

    // Pin thread
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error: updateError } = await (supabase as any)
      .from('threads')
      .update({
        is_pinned: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', threadId);

    if (updateError) {
      throw new Error(`Failed to pin thread: ${updateError.message}`);
    }

    // Log the moderation action
    await logModerationAction(
      'pin_thread',
      threadId,
      'thread',
      'Thread pinned',
      adminProfile,
      { title: thread.title }
    );

    revalidatePath('/admin/content');
    revalidatePath('/');
  });
}

/**
 * Unpin a thread
 *
 * @param threadId - The ID of the thread to unpin
 * @returns AdminActionResult<void>
 */
export async function unpinThread(threadId: string): Promise<AdminActionResult<void>> {
  return withAdminAuth(async (adminProfile) => {
    const supabase = await createClient();

    // Rate limiting
    if (!checkRateLimit(`unpin-thread-${adminProfile.id}`, 20, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before unpinning more threads.');
    }

    // Get thread
    const { data: thread, error: fetchError } = await supabase
      .from('threads')
      .select('id, title, is_pinned')
      .eq('id', threadId)
      .single() as { data: ThreadPinQueryResult | null; error: QueryError };

    if (fetchError || !thread) {
      throw new Error('Thread not found');
    }

    if (!thread.is_pinned) {
      throw new Error('Thread is not pinned');
    }

    // Unpin thread
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error: updateError } = await (supabase as any)
      .from('threads')
      .update({
        is_pinned: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', threadId);

    if (updateError) {
      throw new Error(`Failed to unpin thread: ${updateError.message}`);
    }

    // Log the moderation action
    await logModerationAction(
      'unpin_thread',
      threadId,
      'thread',
      'Thread unpinned',
      adminProfile,
      { title: thread.title }
    );

    revalidatePath('/admin/content');
    revalidatePath('/');
  });
}
