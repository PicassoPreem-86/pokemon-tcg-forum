import { createClient } from '@/lib/supabase/server';
import type { ThreadWithAuthor, Profile, Category } from '@/lib/supabase/database.types';

// Helper type for raw thread data from Supabase
interface RawThreadData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  category_id: string;
  author_id: string;
  view_count: number;
  post_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_hot: boolean;
  created_at: string;
  updated_at: string;
  author: Profile;
  category: Category;
  tags: { tag: string }[] | null;
}

export async function getThreads(options?: {
  categoryId?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at' | 'view_count';
  orderDirection?: 'asc' | 'desc';
}) {
  const supabase = await createClient();

  const {
    categoryId,
    limit = 20,
    offset = 0,
    orderBy = 'updated_at',
    orderDirection = 'desc',
  } = options || {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('threads')
    .select(`
      *,
      author:profiles(*),
      category:categories(*),
      tags:thread_tags(tag)
    `)
    .order(orderBy, { ascending: orderDirection === 'asc' })
    .range(offset, offset + limit - 1);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query as { data: RawThreadData[] | null; error: Error | null };

  if (error) {
    console.error('Error fetching threads:', error);
    return [];
  }

  // Transform tags from array of objects to array of strings
  return (data || []).map((thread) => ({
    ...thread,
    tags: thread.tags?.map((t) => t.tag) || [],
  })) as unknown as ThreadWithAuthor[];
}

export async function getThreadBySlug(slug: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('threads')
    .select(`
      *,
      author:profiles(*),
      category:categories(*),
      tags:thread_tags(tag)
    `)
    .eq('slug', slug)
    .single() as { data: RawThreadData | null; error: Error | null };

  if (error) {
    console.error('Error fetching thread:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    tags: data.tags?.map((t) => t.tag) || [],
  } as unknown as ThreadWithAuthor;
}

export async function getThreadById(id: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('threads')
    .select(`
      *,
      author:profiles(*),
      category:categories(*),
      tags:thread_tags(tag)
    `)
    .eq('id', id)
    .single() as { data: RawThreadData | null; error: Error | null };

  if (error) {
    console.error('Error fetching thread:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    tags: data.tags?.map((t) => t.tag) || [],
  } as unknown as ThreadWithAuthor;
}

export async function getHotThreads(limit = 10) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('threads')
    .select(`
      *,
      author:profiles(*),
      category:categories(*),
      tags:thread_tags(tag)
    `)
    .eq('is_hot', true)
    .order('updated_at', { ascending: false })
    .limit(limit) as { data: RawThreadData[] | null; error: Error | null };

  if (error) {
    console.error('Error fetching hot threads:', error);
    return [];
  }

  return (data || []).map((thread) => ({
    ...thread,
    tags: thread.tags?.map((t) => t.tag) || [],
  })) as unknown as ThreadWithAuthor[];
}

export async function getPinnedThreads(categoryId?: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('threads')
    .select(`
      *,
      author:profiles(*),
      category:categories(*),
      tags:thread_tags(tag)
    `)
    .eq('is_pinned', true)
    .order('updated_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query as { data: RawThreadData[] | null; error: Error | null };

  if (error) {
    console.error('Error fetching pinned threads:', error);
    return [];
  }

  return (data || []).map((thread) => ({
    ...thread,
    tags: thread.tags?.map((t) => t.tag) || [],
  })) as unknown as ThreadWithAuthor[];
}

export async function searchThreads(query: string, limit = 20) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('threads')
    .select(`
      *,
      author:profiles(*),
      category:categories(*),
      tags:thread_tags(tag)
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('updated_at', { ascending: false })
    .limit(limit) as { data: RawThreadData[] | null; error: Error | null };

  if (error) {
    console.error('Error searching threads:', error);
    return [];
  }

  return (data || []).map((thread) => ({
    ...thread,
    tags: thread.tags?.map((t) => t.tag) || [],
  })) as unknown as ThreadWithAuthor[];
}
