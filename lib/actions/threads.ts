'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sanitizeHtml, createSafeExcerpt } from '@/lib/sanitize';
import { createNotification } from './notifications';
import { extractAndValidateMentions } from '@/lib/mentions';
import { checkRateLimit, formatRetryTime } from '@/lib/rate-limit';
import { createThreadSchema, updateThreadSchema, validateInput } from '@/lib/validation';
import { createTypedQueries } from '@/lib/supabase/typed-queries';
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

  // SECURITY: Validate all inputs with comprehensive validation
  const validation = validateInput(createThreadSchema, data);
  if (!validation.success || !validation.data) {
    const firstError = Object.values(validation.errors || {})[0];
    return { success: false, error: firstError || 'Invalid input data' };
  }

  const { title, content, categoryId, tags } = validation.data;

  // Look up category UUID by slug (frontend sends slug like 'general', db uses UUID)
  const queries = createTypedQueries(supabase);
  const { data: category, error: categoryError } = await queries.categories.getCategoryById(categoryId);

  if (categoryError || !category) {
    console.error('Category lookup error:', categoryError);
    return { success: false, error: 'Invalid category selected' };
  }

  const categoryUUID = category.id;
  const slug = generateSlug(title);

  // SECURITY: Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = sanitizeHtml(content.trim());
  const excerpt = createSafeExcerpt(sanitizedContent, 200);

  // Create the thread using admin client (bypasses RLS since user is already verified)
  const adminClient = createAdminClient();
  const adminQueries = createTypedQueries(adminClient);
  const { data: thread, error } = await adminQueries.threads.createThread({
    slug,
    title: title.trim(),
    content: sanitizedContent,
    excerpt,
    category_id: categoryUUID,
    author_id: user.id,
  });

  if (error) {
    console.error('Create thread error:', error);
    return { success: false, error: 'Failed to create thread' };
  }

  // Add tags if provided
  if (tags && tags.length > 0 && thread) {
    await adminQueries.tags.createThreadTags(thread.id, tags);
  }

  // Process @mentions in the thread content
  try {
    // Extract and validate mentioned users
    const mentionedUsers = await extractAndValidateMentions(sanitizedContent);

    if (mentionedUsers.length > 0 && thread) {
      // Get actor username for mention notifications
      const { data: actorProfile } = await queries.profiles.getProfileById(user.id);

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

  return { success: true, threadSlug: thread?.slug, threadId: thread?.id };
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

  // SECURITY: Validate all inputs with comprehensive validation
  const validation = validateInput(updateThreadSchema, data);
  if (!validation.success || !validation.data) {
    const firstError = Object.values(validation.errors || {})[0];
    return { success: false, error: firstError || 'Invalid input data' };
  }

  const { threadId, title, content } = validation.data;

  // Check ownership
  const queries = createTypedQueries(supabase);
  const { data: thread } = await queries.threads.getThreadById(threadId, 'author_id, slug, category_id');

  if (!thread) {
    return { success: false, error: 'Thread not found' };
  }

  // Check if user is author or moderator/admin
  const { data: profile } = await queries.profiles.getProfileRole(user.id);

  const isOwner = thread.author_id === user.id;
  const isMod = profile?.role === 'moderator' || profile?.role === 'admin';

  if (!isOwner && !isMod) {
    return { success: false, error: 'You do not have permission to edit this thread' };
  }

  // SECURITY: Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = sanitizeHtml(content.trim());
  const excerpt = createSafeExcerpt(sanitizedContent, 200);

  // Update the thread
  const { error } = await queries.threads.updateThread(threadId, {
    title: title.trim(),
    content: sanitizedContent,
    excerpt,
  });

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
  const queries = createTypedQueries(supabase);
  const { data: thread } = await queries.threads.getThreadById(threadId, 'author_id, category_id');

  if (!thread) {
    return { success: false, error: 'Thread not found' };
  }

  // Check if user is author or moderator/admin
  const { data: profile } = await queries.profiles.getProfileRole(user.id);

  const isOwner = thread.author_id === user.id;
  const isMod = profile?.role === 'moderator' || profile?.role === 'admin';

  if (!isOwner && !isMod) {
    return { success: false, error: 'You do not have permission to delete this thread' };
  }

  // Delete the thread (cascades to replies, tags, likes)
  const { error } = await queries.threads.deleteThread(threadId);

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
  const queries = createTypedQueries(supabase);
  await queries.rpc.incrementViewCount(threadId);
}

export async function toggleThreadLike(threadId: string): Promise<{ liked: boolean }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { liked: false };
  }

  const queries = createTypedQueries(supabase);

  // Check if already liked
  const { data: existingLike } = await queries.likes.getThreadLike(threadId, user.id);

  const isNowLiked = !existingLike;

  if (existingLike) {
    // Unlike
    await queries.likes.deleteThreadLike(existingLike.id);
  } else {
    // Like
    await queries.likes.createThreadLike(threadId, user.id);

    // Create notification for thread author (if not liking own thread)
    try {
      // Get thread details with author
      const { data: threadDetails } = await queries.threads.getThreadById(threadId, 'id, slug, title, author_id');

      if (threadDetails && threadDetails.author_id !== user.id) {
        // Get actor username for notification message
        const { data: actorProfile } = await queries.profiles.getProfileById(user.id);

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
