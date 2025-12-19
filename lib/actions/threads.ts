'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Thread, Profile } from '@/lib/supabase/database.types';

export interface ThreadResult {
  success: boolean;
  error?: string;
  threadSlug?: string;
}

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
  const excerpt = content.trim().substring(0, 200) + (content.length > 200 ? '...' : '');

  // Create the thread
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: thread, error } = await (supabase as any)
    .from('threads')
    .insert({
      slug,
      title: title.trim(),
      content: content.trim(),
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

  const excerpt = content.trim().substring(0, 200) + (content.length > 200 ? '...' : '');

  // Update the thread
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('threads')
    .update({
      title: title.trim(),
      content: content.trim(),
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

  if (existingLike) {
    // Unlike
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('thread_likes')
      .delete()
      .eq('id', existingLike.id);
    return { liked: false };
  } else {
    // Like
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('thread_likes')
      .insert({ thread_id: threadId, user_id: user.id });
    return { liked: true };
  }
}
