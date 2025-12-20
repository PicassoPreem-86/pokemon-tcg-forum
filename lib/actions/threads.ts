'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Thread, Profile } from '@/lib/supabase/database.types';
import { sanitizeHtml, createSafeExcerpt } from '@/lib/sanitize';
import { createNotification } from './notifications';
import { extractAndValidateMentions } from '@/lib/mentions';
import { checkRateLimit, formatRetryTime } from '@/lib/rate-limit';
// Import types from separate file (Next.js 15/16 'use server' files can only export async functions)
import type { ThreadResult } from './action-types';

// Re-export types for consumers
export type { ThreadResult } from './action-types';

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');

  // Add random suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${suffix}`;
}

interface CreateThreadData {
  title: string;
  content: string;
  categoryId: string;
  tags?: string[];
}

export async function createThread(data: CreateThreadData): Promise<ThreadResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to create a thread' };
  }

  // SECURITY: Check rate limit for thread creation
  const rateLimitResult = await checkRateLimit(user.id, 'thread_create');
  if (!rateLimitResult.allowed) {
    const retryTime = await formatRetryTime(rateLimitResult.retryAfter || 0);
    return {
      success: false,
      error: `You're creating threads too fast. Please wait ${retryTime} before trying again.`,
    };
  }

  const { title, content, categoryId, tags } = data;

  // Validate inputs
  if (!title || title.trim().length < 10) {
    return { success: false, error: 'Title must be at least 10 characters' };
  }

  if (!content || content.trim().length < 20) {
    return { success: false, error: 'Content must be at least 20 characters' };
  }

  if (!categoryId) {
    return { success: false, error: 'Category is required' };
  }

  const slug = generateSlug(title);

  // SECURITY: Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = sanitizeHtml(content.trim());
  const excerpt = createSafeExcerpt(sanitizedContent, 200);

  // Create the thread
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: thread, error } = await (supabase as any)
    .from('threads')
    .insert({
      slug,
      title: title.trim(),
      content: sanitizedContent,
      excerpt,
      category_id: categoryId,
      author_id: user.id,
    })
    .select()
    .single() as { data: Thread | null; error: Error | null };

  if (error) {
    console.error('Create thread error:', error);
    return { success: false, error: 'Failed to create thread' };
  }

  // Add tags if provided
  if (tags && tags.length > 0) {
    const tagInserts = tags.map(tag => ({
      thread_id: thread!.id,
      tag,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('thread_tags').insert(tagInserts);
  }

  // Process @mentions in the thread content
  try {
    // Extract and validate mentioned users
    const mentionedUsers = await extractAndValidateMentions(sanitizedContent);

    if (mentionedUsers.length > 0 && thread) {
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

          const mentionMessage = `${actorProfile.username} mentioned you in their thread "${thread.title}"`;
          const mentionLink = `/thread/${thread.slug}`;

          // Don't await - let notification creation happen in background
          createNotification(
            mentionedUser.id,
            user.id,
            'mention',
            mentionMessage,
            mentionLink
          ).catch(err => console.error('[createThread] Mention notification error:', err));
        }
      }
    }
  } catch (mentionError) {
    // Log but don't fail the thread creation
    console.error('[createThread] Failed to process mentions:', mentionError);
  }

  revalidatePath('/');
  revalidatePath(`/c/${categoryId}`);

  return { success: true, threadSlug: thread?.slug };
}

interface UpdateThreadData {
  threadId: string;
  title: string;
  content: string;
}

export async function updateThread(data: UpdateThreadData): Promise<ThreadResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to edit a thread' };
  }

  const { threadId, title, content } = data;

  if (!threadId) {
    return { success: false, error: 'Thread ID is required' };
  }

  // Check ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: thread } = await (supabase as any)
    .from('threads')
    .select('author_id, slug, category_id')
    .eq('id', threadId)
    .single() as { data: Pick<Thread, 'author_id' | 'slug' | 'category_id'> | null };

  if (!thread) {
    return { success: false, error: 'Thread not found' };
  }

  // Check if user is author or moderator/admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: Pick<Profile, 'role'> | null };

  const isOwner = thread.author_id === user.id;
  const isMod = profile?.role === 'moderator' || profile?.role === 'admin';

  if (!isOwner && !isMod) {
    return { success: false, error: 'You do not have permission to edit this thread' };
  }

  // Validate inputs
  if (!title || title.trim().length < 10) {
    return { success: false, error: 'Title must be at least 10 characters' };
  }

  if (!content || content.trim().length < 20) {
    return { success: false, error: 'Content must be at least 20 characters' };
  }

  // SECURITY: Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = sanitizeHtml(content.trim());
  const excerpt = createSafeExcerpt(sanitizedContent, 200);

  // Update the thread
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('threads')
    .update({
      title: title.trim(),
      content: sanitizedContent,
      excerpt,
    })
    .eq('id', threadId);

  if (error) {
    console.error('Update thread error:', error);
    return { success: false, error: 'Failed to update thread' };
  }

  revalidatePath('/');
  revalidatePath(`/thread/${thread.slug}`);
  revalidatePath(`/c/${thread.category_id}`);

  return { success: true, threadSlug: thread.slug };
}

export async function deleteThread(threadId: string): Promise<ThreadResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to delete a thread' };
  }

  // Check ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: thread } = await (supabase as any)
    .from('threads')
    .select('author_id, category_id')
    .eq('id', threadId)
    .single() as { data: Pick<Thread, 'author_id' | 'category_id'> | null };

  if (!thread) {
    return { success: false, error: 'Thread not found' };
  }

  // Check if user is author or moderator/admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: Pick<Profile, 'role'> | null };

  const isOwner = thread.author_id === user.id;
  const isMod = profile?.role === 'moderator' || profile?.role === 'admin';

  if (!isOwner && !isMod) {
    return { success: false, error: 'You do not have permission to delete this thread' };
  }

  // Delete the thread (cascades to replies, tags, likes)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('threads')
    .delete()
    .eq('id', threadId);

  if (error) {
    console.error('Delete thread error:', error);
    return { success: false, error: 'Failed to delete thread' };
  }

  revalidatePath('/');
  revalidatePath(`/c/${thread.category_id}`);

  return { success: true };
}

export async function incrementViewCount(threadId: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc('increment_view_count', { p_thread_id: threadId });
}

export async function toggleThreadLike(threadId: string): Promise<{ liked: boolean }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { liked: false };
  }

  // Check if already liked
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingLike } = await (supabase as any)
    .from('thread_likes')
    .select('id')
    .eq('thread_id', threadId)
    .eq('user_id', user.id)
    .single() as { data: { id: string } | null };

  const isNowLiked = !existingLike;

  if (existingLike) {
    // Unlike
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('thread_likes')
      .delete()
      .eq('id', existingLike.id);
  } else {
    // Like
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('thread_likes')
      .insert({ thread_id: threadId, user_id: user.id });

    // Create notification for thread author (if not liking own thread)
    try {
      // Get thread details with author
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: threadDetails } = await (supabase as any)
        .from('threads')
        .select('id, slug, title, author_id')
        .eq('id', threadId)
        .single() as {
          data: {
            id: string;
            slug: string;
            title: string;
            author_id: string;
          } | null
        };

      if (threadDetails && threadDetails.author_id !== user.id) {
        // Get actor username for notification message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: actorProfile } = await (supabase as any)
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single() as { data: { username: string } | null };

        if (actorProfile) {
          const notificationMessage = `${actorProfile.username} liked your thread "${threadDetails.title}"`;
          const notificationLink = `/thread/${threadDetails.slug}`;

          // Don't await - let notification creation happen in background
          createNotification(
            threadDetails.author_id,
            user.id,
            'like',
            notificationMessage,
            notificationLink
          ).catch(err => console.error('[toggleThreadLike] Notification error:', err));
        }
      }
    } catch (notifError) {
      // Log but don't fail the like action
      console.error('[toggleThreadLike] Failed to create notification:', notifError);
    }
  }

  return { liked: isNowLiked };
}
