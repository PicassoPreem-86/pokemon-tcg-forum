/**
 * Database Query Helpers for TCG Gossip
 *
 * This file contains all database queries for fetching real data
 * from Supabase, replacing the mock data.
 */

import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

// ============================================
// TYPES
// ============================================

export interface Thread {
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
  };
  category: {
    id: string;
    slug: string;
    name: string;
    color: string;
  };
  tags?: string[];
}

export interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  bio: string | null;
  location: string | null;
  post_count: number;
  reputation: number;
  created_at: string;
}

export interface ForumStats {
  totalMembers: number;
  totalThreads: number;
  totalPosts: number;
  onlineNow: number;
  newestMember: string;
}

export interface TagWithCount {
  tag: string;
  count: number;
}

// ============================================
// THREAD QUERIES
// ============================================

/**
 * Get latest threads across all categories
 */
export const getLatestThreads = cache(async (limit: number = 10): Promise<Thread[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('threads')
    .select(`
      *,
      author:profiles!author_id(id, username, display_name, avatar_url),
      category:categories!category_id(id, slug, name, color)
    `)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest threads:', error);
    return [];
  }

  return (data || []) as Thread[];
});

/**
 * Get hot/trending threads
 */
export const getHotThreads = cache(async (limit: number = 10): Promise<Thread[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('threads')
    .select(`
      *,
      author:profiles!author_id(id, username, display_name, avatar_url),
      category:categories!category_id(id, slug, name, color)
    `)
    .eq('is_hot', true)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching hot threads:', error);
    return [];
  }

  return (data || []) as Thread[];
});

/**
 * Get threads by category
 */
export const getThreadsByCategory = cache(async (categorySlug: string, limit: number = 20): Promise<Thread[]> => {
  const supabase = await createClient();

  // First get category
  const categoryResult = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .maybeSingle();

  if (categoryResult.error || !categoryResult.data) return [];

  const categoryId = (categoryResult.data as any).id as string;

  const { data, error } = await supabase
    .from('threads')
    .select(`
      *,
      author:profiles!author_id(id, username, display_name, avatar_url),
      category:categories!category_id(id, slug, name, color)
    `)
    .eq('category_id', categoryId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching threads by category:', error);
    return [];
  }

  return (data || []) as Thread[];
});

/**
 * Get thread by ID
 */
export const getThreadById = cache(async (id: string): Promise<Thread | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('threads')
    .select(`
      *,
      author:profiles!author_id(id, username, display_name, avatar_url),
      category:categories!category_id(id, slug, name, color)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching thread by ID:', error);
    return null;
  }

  return data as Thread;
});

/**
 * Get thread by slug
 */
export const getThreadBySlug = cache(async (slug: string): Promise<Thread | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('threads')
    .select(`
      *,
      author:profiles!author_id(id, username, display_name, avatar_url),
      category:categories!category_id(id, slug, name, color)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching thread by slug:', error);
    return null;
  }

  return data as Thread;
});

/**
 * Search threads by query
 */
export const searchThreads = cache(async (query: string, limit: number = 20): Promise<Thread[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('threads')
    .select(`
      *,
      author:profiles!author_id(id, username, display_name, avatar_url),
      category:categories!category_id(id, slug, name, color)
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching threads:', error);
    return [];
  }

  return (data || []) as Thread[];
});

// ============================================
// USER QUERIES
// ============================================

/**
 * Get online users (last activity within 15 minutes)
 */
export const getOnlineUsers = cache(async (limit: number = 20): Promise<string[]> => {
  const supabase = await createClient();

  // Get users active in the last 15 minutes
  const fifteenMinutesAgo = new Date();
  fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .gte('last_seen', fifteenMinutesAgo.toISOString())
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('last_seen', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching online users:', error);
    return [];
  }

  return (data || []).map((user: any) => user.username);
});

/**
 * Search users by username or display name
 */
export const searchUsers = cache(async (query: string, limit: number = 20): Promise<User[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return (data || []) as User[];
});

/**
 * Get user by username
 */
export const getUserByUsername = cache(async (username: string): Promise<User | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }

  return data as User;
});

/**
 * Get all users (for members page)
 */
export const getAllUsers = cache(async (limit: number = 50): Promise<User[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('reputation', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching all users:', error);
    return [];
  }

  return (data || []) as User[];
});

// ============================================
// STATISTICS QUERIES
// ============================================

/**
 * Get forum statistics
 */
export const getForumStats = cache(async (): Promise<ForumStats> => {
  const supabase = await createClient();

  // Get total members
  const { count: totalMembers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get total threads
  const { count: totalThreads } = await supabase
    .from('threads')
    .select('*', { count: 'exact', head: true });

  // Get total posts (threads + replies)
  const { count: totalReplies } = await supabase
    .from('replies')
    .select('*', { count: 'exact', head: true });

  // Get newest member
  const newestResult = await supabase
    .from('profiles')
    .select('username')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const newest = newestResult.data ? (newestResult.data as any).username as string : 'No members yet';

  // Get online users count (active in last 15 minutes)
  const fifteenMinutesAgo = new Date();
  fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

  const { count: onlineCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', fifteenMinutesAgo.toISOString())
    .eq('status', 'active')
    .is('deleted_at', null);

  return {
    totalMembers: totalMembers || 0,
    totalThreads: totalThreads || 0,
    totalPosts: (totalThreads || 0) + (totalReplies || 0),
    onlineNow: onlineCount || 0,
    newestMember: newest,
  };
});

// ============================================
// TAG QUERIES
// ============================================

/**
 * Get popular tags with counts
 */
export const getPopularTags = cache(async (limit: number = 20): Promise<TagWithCount[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('thread_tags')
    .select('tag')
    .order('tag');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  // Count occurrences of each tag
  const tagCounts = new Map<string, number>();
  data?.forEach((row: any) => {
    const count = tagCounts.get(row.tag) || 0;
    tagCounts.set(row.tag, count + 1);
  });

  // Convert to array and sort by count
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
});

/**
 * Get threads by tag
 */
export const getThreadsByTag = cache(async (tag: string, limit: number = 20): Promise<Thread[]> => {
  const supabase = await createClient();

  // Get thread IDs with this tag
  const { data: tagData } = await supabase
    .from('thread_tags')
    .select('thread_id')
    .eq('tag', tag);

  if (!tagData || tagData.length === 0) return [];

  const threadIds = tagData.map((t: any) => t.thread_id);

  const { data, error } = await supabase
    .from('threads')
    .select(`
      *,
      author:profiles!author_id(id, username, display_name, avatar_url),
      category:categories!category_id(id, slug, name, color)
    `)
    .in('id', threadIds)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching threads by tag:', error);
    return [];
  }

  return (data || []) as Thread[];
});

/**
 * Get all tags for a thread
 */
export const getThreadTags = cache(async (threadId: string): Promise<string[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('thread_tags')
    .select('tag')
    .eq('thread_id', threadId);

  if (error) {
    console.error('Error fetching thread tags:', error);
    return [];
  }

  return (data || []).map((t: any) => t.tag);
});

// ============================================
// CATEGORY QUERIES
// ============================================

/**
 * Get all categories
 */
export const getAllCategories = cache(async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
});

/**
 * Get category by slug
 */
export const getCategoryBySlug = cache(async (slug: string) => {
  const supabase = await createClient();

  const { data, error} = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }

  return data;
});

/**
 * Get categories by game
 */
export const getCategoriesByGame = cache(async (game: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('game', game)
    .order('sort_order');

  if (error) {
    console.error('Error fetching categories by game:', error);
    return [];
  }

  return data || [];
});

/**
 * Get categories grouped by game
 */
export const getCategoriesGroupedByGame = cache(async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('game')
    .order('sort_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return {};
  }

  // Group categories by game
  const grouped = (data || []).reduce((acc: Record<string, any[]>, category: any) => {
    const game = category.game || 'pokemon';
    if (!acc[game]) {
      acc[game] = [];
    }
    acc[game].push(category);
    return acc;
  }, {});

  return grouped;
});
