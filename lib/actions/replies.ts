'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Thread, Reply, Profile } from '@/lib/supabase/database.types';
import { createNotification } from './notifications';
import { sanitizeHtml } from '@/lib/sanitize';
import { extractAndValidateMentions } from '@/lib/mentions';
import { checkRateLimit, formatRetryTime } from '@/lib/rate-limit';
// Import types from separate file (Next.js 15/16 'use server' files can only export async functions)
import type { ReplyResult } from './action-types';

// Re-export types for consumers
export type { ReplyResult } from './action-types';

interface ReplyImage {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface CreateReplyData {
  threadId: string;
  content: string;
  parentReplyId?: string | null;
  images?: ReplyImage[];
}

export async function createReply(data: CreateReplyData): Promise<ReplyResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to reply' };
  }

  // SECURITY: Check rate limit for reply creation
  const rateLimitResult = await checkRateLimit(user.id, 'reply_create');
  if (!rateLimitResult.allowed) {
    const retryTime = await formatRetryTime(rateLimitResult.retryAfter || 0);
    return {
      success: false,
      error: `You're posting too fast. Please wait ${retryTime} before trying again.`,
    };
  }

  const { threadId, content, parentReplyId, images } = data;

  // Validate inputs
  if (!threadId) {
    return { success: false, error: 'Thread ID is required' };
  }

  if (!content || content.trim().length < 5) {
    return { success: false, error: 'Reply must be at least 5 characters' };
  }

  // Validate images (max 4)
  if (images && images.length > 4) {
    return { success: false, error: 'Maximum 4 images allowed per reply' };
  }

  // Check if thread exists and isn't locked
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: thread } = await (supabase as any)
    .from('threads')
    .select('id, slug, is_locked')
    .eq('id', threadId)
    .single() as { data: Pick<Thread, 'id' | 'slug' | 'is_locked'> | null };

  if (!thread) {
    return { success: false, error: 'Thread not found' };
  }

  if (thread.is_locked) {
    return { success: false, error: 'This thread is locked' };
  }

  // SECURITY: Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = sanitizeHtml(content.trim());

  // Create the reply
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reply, error } = await (supabase as any)
    .from('replies')
    .insert({
      thread_id: threadId,
      author_id: user.id,
      content: sanitizedContent,
      parent_reply_id: parentReplyId || null,
      images: images ? JSON.stringify(images) : '[]',
    })
    .select()
    .single() as { data: Reply | null; error: Error | null };

  if (error) {
    console.error('Create reply error:', error);
    return { success: false, error: 'Failed to create reply' };
  }

  // Create notification for thread author (if not replying to own thread)
  try {
    // Get thread details with author
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: threadWithAuthor } = await (supabase as any)
      .from('threads')
      .select(`
        id,
        slug,
        title,
        author_id
      `)
      .eq('id', threadId)
      .single() as { data: { id: string; slug: string; title: string; author_id: string } | null };

    if (threadWithAuthor && threadWithAuthor.author_id !== user.id) {
      // Get actor username for notification message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: actorProfile } = await (supabase as any)
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single() as { data: { username: string } | null };

      if (actorProfile) {
        const notificationMessage = `${actorProfile.username} replied to your thread "${threadWithAuthor.title}"`;
        const notificationLink = `/thread/${threadWithAuthor.slug}`;

        // Don't await - let notification creation happen in background
        createNotification(
          threadWithAuthor.author_id,
          user.id,
          'reply',
          notificationMessage,
          notificationLink
        ).catch(err => console.error('[createReply] Notification error:', err));
      }
    }

    // Process @mentions in the reply content
    // Extract and validate mentioned users
    const mentionedUsers = await extractAndValidateMentions(sanitizedContent);

    if (mentionedUsers.length > 0 && threadWithAuthor) {
      // Get actor username for mention notifications
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: actorProfile } = await (supabase as any)
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single() as { data: { username: string } | null };

      if (actorProfile) {
        // Create mention notification for each mentioned user
        for (const mentionedUser of mentionedUsers) {
          // Don't notify if user mentions themselves
          if (mentionedUser.id === user.id) {
            continue;
          }

          // Don't duplicate notification if already notifying thread author
          if (mentionedUser.id === threadWithAuthor.author_id) {
            continue;
          }

          const mentionMessage = `${actorProfile.username} mentioned you in "${threadWithAuthor.title}"`;
          const mentionLink = `/thread/${threadWithAuthor.slug}`;

          // Don't await - let notification creation happen in background
          createNotification(
            mentionedUser.id,
            user.id,
            'mention',
            mentionMessage,
            mentionLink
          ).catch(err => console.error('[createReply] Mention notification error:', err));
        }
      }
    }
  } catch (notifError) {
    // Log but don't fail the reply creation
    console.error('[createReply] Failed to create notification:', notifError);
  }

  revalidatePath(`/thread/${thread.slug}`);

  return { success: true, replyId: reply?.id };
}

interface UpdateReplyData {
  replyId: string;
  content: string;
}

export async function updateReply(data: UpdateReplyData): Promise<ReplyResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to edit a reply' };
  }

  const { replyId, content } = data;

  if (!replyId) {
    return { success: false, error: 'Reply ID is required' };
  }

  if (!content || content.trim().length < 5) {
    return { success: false, error: 'Reply must be at least 5 characters' };
  }

  // Check ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reply } = await (supabase as any)
    .from('replies')
    .select('author_id, thread_id')
    .eq('id', replyId)
    .single() as { data: Pick<Reply, 'author_id' | 'thread_id'> | null };

  if (!reply) {
    return { success: false, error: 'Reply not found' };
  }

  if (reply.author_id !== user.id) {
    // Check if moderator/admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: Pick<Profile, 'role'> | null };

    if (profile?.role !== 'moderator' && profile?.role !== 'admin') {
      return { success: false, error: 'You do not have permission to edit this reply' };
    }
  }

  // SECURITY: Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = sanitizeHtml(content.trim());

  // Update the reply
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('replies')
    .update({
      content: sanitizedContent,
      is_edited: true,
    })
    .eq('id', replyId);

  if (error) {
    console.error('Update reply error:', error);
    return { success: false, error: 'Failed to update reply' };
  }

  // Get thread slug for revalidation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: thread } = await (supabase as any)
    .from('threads')
    .select('slug')
    .eq('id', reply.thread_id)
    .single() as { data: Pick<Thread, 'slug'> | null };

  if (thread?.slug) {
    revalidatePath(`/thread/${thread.slug}`);
  }

  return { success: true, replyId };
}

export async function deleteReply(replyId: string): Promise<ReplyResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to delete a reply' };
  }

  // Check ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reply } = await (supabase as any)
    .from('replies')
    .select('author_id, thread_id')
    .eq('id', replyId)
    .single() as { data: Pick<Reply, 'author_id' | 'thread_id'> | null };

  if (!reply) {
    return { success: false, error: 'Reply not found' };
  }

  const isOwner = reply.author_id === user.id;

  if (!isOwner) {
    // Check if moderator/admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: Pick<Profile, 'role'> | null };

    if (profile?.role !== 'moderator' && profile?.role !== 'admin') {
      return { success: false, error: 'You do not have permission to delete this reply' };
    }
  }

  // Delete the reply (cascades to child replies, images, likes)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('replies')
    .delete()
    .eq('id', replyId);

  if (error) {
    console.error('Delete reply error:', error);
    return { success: false, error: 'Failed to delete reply' };
  }

  // Get thread slug for revalidation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: thread } = await (supabase as any)
    .from('threads')
    .select('slug')
    .eq('id', reply.thread_id)
    .single() as { data: Pick<Thread, 'slug'> | null };

  if (thread?.slug) {
    revalidatePath(`/thread/${thread.slug}`);
  }

  return { success: true };
}

export async function toggleReplyLike(replyId: string): Promise<{ liked: boolean; likeCount: number }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { liked: false, likeCount: 0 };
  }

  // Check if already liked
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingLike } = await (supabase as any)
    .from('reply_likes')
    .select('id')
    .eq('reply_id', replyId)
    .eq('user_id', user.id)
    .single() as { data: { id: string } | null };

  const isNowLiked = !existingLike;

  if (existingLike) {
    // Unlike
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('reply_likes')
      .delete()
      .eq('id', existingLike.id);
  } else {
    // Like
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('reply_likes')
      .insert({ reply_id: replyId, user_id: user.id });

    // Create notification for reply author (if not liking own reply)
    try {
      // Get reply details with author and thread info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: replyDetails } = await (supabase as any)
        .from('replies')
        .select(`
          id,
          author_id,
          thread_id,
          threads!inner(slug, title)
        `)
        .eq('id', replyId)
        .single() as {
          data: {
            id: string;
            author_id: string;
            thread_id: string;
            threads: { slug: string; title: string };
          } | null
        };

      if (replyDetails && replyDetails.author_id !== user.id) {
        // Get actor username for notification message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: actorProfile } = await (supabase as any)
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single() as { data: { username: string } | null };

        if (actorProfile && replyDetails.threads) {
          const notificationMessage = `${actorProfile.username} liked your reply`;
          const notificationLink = `/thread/${replyDetails.threads.slug}`;

          // Don't await - let notification creation happen in background
          createNotification(
            replyDetails.author_id,
            user.id,
            'like',
            notificationMessage,
            notificationLink
          ).catch(err => console.error('[toggleReplyLike] Notification error:', err));
        }
      }
    } catch (notifError) {
      // Log but don't fail the like action
      console.error('[toggleReplyLike] Failed to create notification:', notifError);
    }
  }

  // Get updated like count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reply } = await (supabase as any)
    .from('replies')
    .select('like_count')
    .eq('id', replyId)
    .single() as { data: Pick<Reply, 'like_count'> | null };

  return {
    liked: isNowLiked,
    likeCount: reply?.like_count || 0,
  };
}
