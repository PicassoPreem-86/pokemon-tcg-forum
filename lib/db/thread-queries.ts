/**
 * Thread Detail & Replies Queries
 * Comprehensive queries for thread detail pages
 */

import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

// ============================================
// TYPES
// ============================================

export interface Reply {
  id: string;
  thread_id: string;
  parent_reply_id: string | null;
  author_id: string;
  content: string;
  like_count: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    role: string;
    post_count: number;
    reputation: number;
    created_at: string;
    location: string | null;
    signature: string | null;
  };
  images?: {
    url: string;
    alt: string | null;
    width: number | null;
    height: number | null;
  }[];
}

export interface ThreadDetail {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  category_id: string;
  author_id: string;
  view_count: number;
  post_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_hot: boolean;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    role: string;
    post_count: number;
    reputation: number;
    created_at: string;
    location: string | null;
    signature: string | null;
  };
  category: {
    id: string;
    slug: string;
    name: string;
    color: string;
  };
  tags: string[];
  replies: Reply[];
}

// ============================================
// THREAD DETAIL QUERIES
// ============================================

/**
 * Get thread with all details including replies
 */
export const getThreadDetailBySlug = cache(async (slug: string): Promise<ThreadDetail | null> => {
  try {
    const supabase = await createClient();

    // Get thread with author and category
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select(`
        *,
        author:profiles!author_id(
          id,
          username,
          display_name,
          avatar_url,
          role,
          post_count,
          reputation,
          created_at,
          location,
          signature
        ),
        category:categories!category_id(id, slug, name, color)
      `)
      .eq('slug', slug)
      .single() as { data: any; error: any };

    if (threadError || !thread) {
      console.error('Error fetching thread:', threadError);
      return null;
    }

    // Get thread tags
    const { data: tagData } = await supabase
      .from('thread_tags')
      .select('tag')
      .eq('thread_id', thread.id);

    const tags = tagData?.map((t: any) => t.tag) || [];

    // Get replies with author info and images
    const { data: replies, error: repliesError } = await supabase
      .from('replies')
      .select(`
        *,
        author:profiles!author_id(
          id,
          username,
          display_name,
          avatar_url,
          role,
          post_count,
          reputation,
          created_at,
          location,
          signature
        ),
        images:reply_images(url, alt, width, height)
      `)
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true });

    if (repliesError) {
      console.error('Error fetching replies:', repliesError);
    }

    return {
      ...thread,
      tags,
      replies: (replies || []) as Reply[],
    } as ThreadDetail;
  } catch (error) {
    console.error('Error in getThreadDetailBySlug:', error);
    return null;
  }
});

/**
 * Get thread with pagination for replies
 */
export const getThreadDetailWithPagination = cache(async (
  slug: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ thread: ThreadDetail | null; hasMore: boolean }> => {
  try {
    const supabase = await createClient();

    // Get thread with author and category
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select(`
        *,
        author:profiles!author_id(
          id,
          username,
          display_name,
          avatar_url,
          role,
          post_count,
          reputation,
          created_at,
          location,
          signature
        ),
        category:categories!category_id(id, slug, name, color)
      `)
      .eq('slug', slug)
      .single() as { data: any; error: any };

    if (threadError || !thread) {
      return { thread: null, hasMore: false };
    }

    // Get thread tags
    const { data: tagData } = await supabase
      .from('thread_tags')
      .select('tag')
      .eq('thread_id', thread.id);

    const tags = tagData?.map((t: any) => t.tag) || [];

    // Get replies with pagination
    const offset = (page - 1) * pageSize;
    const { data: replies, error: repliesError } = await supabase
      .from('replies')
      .select(`
        *,
        author:profiles!author_id(
          id,
          username,
          display_name,
          avatar_url,
          role,
          post_count,
          reputation,
          created_at,
          location,
          signature
        ),
        images:reply_images(url, alt, width, height)
      `)
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true })
      .range(offset, offset + pageSize);

    if (repliesError) {
      console.error('Error fetching replies:', repliesError);
    }

    const totalReplies = thread.post_count - 1; // Subtract the original post
    const hasMore = offset + pageSize < totalReplies;

    return {
      thread: {
        ...thread,
        tags,
        replies: (replies || []) as Reply[],
      } as ThreadDetail,
      hasMore,
    };
  } catch (error) {
    console.error('Error in getThreadDetailWithPagination:', error);
    return { thread: null, hasMore: false };
  }
});

/**
 * Increment thread view count (safe, bypasses RLS)
 */
export async function incrementThreadViews(threadId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // Call the RLS-safe function
    const { error } = await supabase.rpc('increment_thread_view_count', {
      thread_id: threadId
    } as any);

    if (error) {
      console.error('Error incrementing view count:', error);
    }
  } catch (error) {
    console.error('Error in incrementThreadViews:', error);
  }
}

/**
 * Get related threads (same category, similar tags)
 */
export const getRelatedThreads = cache(async (
  threadId: string,
  categoryId: string,
  limit: number = 5
): Promise<any[]> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('threads')
      .select(`
        id,
        slug,
        title,
        view_count,
        post_count,
        created_at,
        category:categories!category_id(name, color)
      `)
      .eq('category_id', categoryId)
      .neq('id', threadId)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching related threads:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRelatedThreads:', error);
    return [];
  }
});

/**
 * Check if user has liked a thread
 */
export async function hasUserLikedThread(threadId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('thread_likes')
      .select('id')
      .eq('thread_id', threadId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}

/**
 * Check if user has liked a reply
 */
export async function hasUserLikedReply(replyId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reply_likes')
      .select('id')
      .eq('reply_id', replyId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}
