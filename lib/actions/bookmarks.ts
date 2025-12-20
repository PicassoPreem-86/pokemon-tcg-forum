'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
// Import types from separate file (Next.js 15/16 'use server' files can only export async functions)
import type { BookmarkResult, BookmarkedThreadData } from './action-types';

// Re-export types for consumers
export type { BookmarkResult, BookmarkedThreadData } from './action-types';

/**
 * Add a bookmark for the current user
 * @param threadId - The thread ID to bookmark
 * @returns Result indicating success and error message if any
 */
export async function addBookmark(threadId: string): Promise<BookmarkResult> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'You must be logged in to bookmark threads' };
  }

  // Validate thread exists
  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select('id')
    .eq('id', threadId)
    .single();

  if (threadError || !thread) {
    return { success: false, error: 'Thread not found' };
  }

  // Check if already bookmarked
  const { data: existingBookmark } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('thread_id', threadId)
    .single();

  if (existingBookmark) {
    return { success: false, error: 'Thread is already bookmarked' };
  }

  // Insert bookmark
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
  const { error: insertError } = await (supabase as any)
    .from('bookmarks')
    .insert({
      user_id: user.id,
      thread_id: threadId,
    });

  if (insertError) {
    console.error('Add bookmark error:', insertError);
    return { success: false, error: 'Failed to add bookmark' };
  }

  revalidatePath('/bookmarks');
  revalidatePath(`/thread/${threadId}`);

  return { success: true, isBookmarked: true };
}

/**
 * Remove a bookmark for the current user
 * @param threadId - The thread ID to unbookmark
 * @returns Result indicating success and error message if any
 */
export async function removeBookmark(threadId: string): Promise<BookmarkResult> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'You must be logged in to remove bookmarks' };
  }

  // Delete bookmark
  const { error: deleteError } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('thread_id', threadId);

  if (deleteError) {
    console.error('Remove bookmark error:', deleteError);
    return { success: false, error: 'Failed to remove bookmark' };
  }

  revalidatePath('/bookmarks');
  revalidatePath(`/thread/${threadId}`);

  return { success: true, isBookmarked: false };
}

/**
 * Toggle bookmark state for a thread
 * @param threadId - The thread ID to toggle bookmark
 * @returns Result with new bookmark state
 */
export async function toggleBookmark(threadId: string): Promise<BookmarkResult> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'You must be logged in to bookmark threads' };
  }

  // Check if already bookmarked
  const { data: existingBookmark } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('thread_id', threadId)
    .single() as { data: { id: string } | null; error: unknown };

  if (existingBookmark) {
    // Remove bookmark
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error: deleteError } = await (supabase as any)
      .from('bookmarks')
      .delete()
      .eq('id', existingBookmark.id);

    if (deleteError) {
      console.error('Toggle bookmark (delete) error:', deleteError);
      return { success: false, error: 'Failed to remove bookmark' };
    }

    revalidatePath('/bookmarks');
    revalidatePath(`/thread/${threadId}`);

    return { success: true, isBookmarked: false };
  } else {
    // Validate thread exists
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select('id')
      .eq('id', threadId)
      .single() as { data: { id: string } | null; error: unknown };

    if (threadError || !thread) {
      return { success: false, error: 'Thread not found' };
    }

    // Add bookmark
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { error: insertError } = await (supabase as any)
      .from('bookmarks')
      .insert({
        user_id: user.id,
        thread_id: threadId,
      });

    if (insertError) {
      console.error('Toggle bookmark (insert) error:', insertError);
      return { success: false, error: 'Failed to add bookmark' };
    }

    revalidatePath('/bookmarks');
    revalidatePath(`/thread/${threadId}`);

    return { success: true, isBookmarked: true };
  }
}

/**
 * Get all bookmarked threads for the current user with full thread details
 * @param limit - Optional limit for number of bookmarks to return
 * @returns Array of bookmarked threads with details
 */
export async function getUserBookmarks(limit?: number): Promise<BookmarkedThreadData[]> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  // Build query
  let query = supabase
    .from('bookmarks')
    .select(`
      id,
      user_id,
      thread_id,
      created_at,
      thread:threads(
        id,
        slug,
        title,
        content,
        excerpt,
        category_id,
        author_id,
        view_count,
        post_count,
        is_pinned,
        is_locked,
        is_hot,
        created_at,
        updated_at,
        category:categories(
          id,
          slug,
          name,
          description,
          icon,
          color,
          sort_order,
          thread_count,
          post_count,
          created_at
        ),
        author:profiles(
          id,
          username,
          display_name,
          avatar_url,
          role,
          bio,
          location,
          signature,
          post_count,
          reputation,
          created_at,
          updated_at
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Apply limit if provided
  if (limit && limit > 0) {
    query = query.limit(limit);
  }

  // Execute query
  const { data, error } = await query;

  if (error) {
    console.error('Get user bookmarks error:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if a thread is bookmarked by the current user
 * @param threadId - The thread ID to check
 * @returns Boolean indicating if thread is bookmarked
 */
export async function isBookmarked(threadId: string): Promise<boolean> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  // Check for existing bookmark
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('thread_id', threadId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}
