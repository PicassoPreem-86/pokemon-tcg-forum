/**
 * Typed Supabase Query Helpers
 *
 * Provides type-safe wrappers around Supabase queries
 * Eliminates the need for 'as any' casts
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Thread, Profile, Category } from './database.types';

/**
 * Pagination result type
 */
export interface PaginatedResult<T> {
  data: T[] | null;
  error: Error | null;
  hasMore: boolean;
  nextCursor: string | null;
}

/**
 * Type-safe thread queries
 */
export class ThreadQueries {
  constructor(private client: SupabaseClient) {}

  async getThreadBySlug(slug: string) {
    return this.client
      .from('threads')
      .select('*')
      .eq('slug', slug)
      .single() as any as Promise<{ data: Thread | null; error: Error | null }>;
  }

  async getThreadById(threadId: string, select = '*') {
    return this.client
      .from('threads')
      .select(select)
      .eq('id', threadId)
      .single() as any as Promise<{ data: Thread | null; error: Error | null }>;
  }

  /**
   * Get paginated threads with cursor-based pagination
   * @param limit Number of threads per page (default: 20)
   * @param cursor Optional cursor for pagination (created_at timestamp)
   * @param categoryId Optional category filter
   */
  async getThreadsPaginated(
    limit = 20,
    cursor: string | null = null,
    categoryId?: string
  ): Promise<PaginatedResult<Thread>> {
    let query = this.client
      .from('threads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit + 1); // Fetch one extra to check if there are more

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query as { data: Thread[] | null; error: Error | null };

    if (error || !data) {
      return { data: null, error, hasMore: false, nextCursor: null };
    }

    const hasMore = data.length > limit;
    const threads = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore && threads.length > 0
      ? threads[threads.length - 1].created_at
      : null;

    return { data: threads, error: null, hasMore, nextCursor };
  }

  async createThread(data: {
    slug: string;
    title: string;
    content: string;
    excerpt: string;
    category_id: string;
    author_id: string;
  }) {
    return this.client
      .from('threads')
      .insert(data)
      .select()
      .single() as any as Promise<{ data: Thread | null; error: Error | null }>;
  }

  async updateThread(threadId: string, data: {
    title?: string;
    content?: string;
    excerpt?: string;
  }) {
    return this.client
      .from('threads')
      .update(data)
      .eq('id', threadId) as any as Promise<{ error: Error | null }>;
  }

  async deleteThread(threadId: string) {
    return this.client
      .from('threads')
      .delete()
      .eq('id', threadId) as any as Promise<{ error: Error | null }>;
  }
}

/**
 * Type-safe profile queries
 */
export class ProfileQueries {
  constructor(private client: SupabaseClient) {}

  async getProfileById(userId: string) {
    return this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single() as any as Promise<{ data: Profile | null; error: Error | null }>;
  }

  async getProfileByUsername(username: string) {
    return this.client
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single() as any as Promise<{ data: Profile | null; error: Error | null }>;
  }

  async getProfileRole(userId: string) {
    return this.client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single() as any as Promise<{ data: Pick<Profile, 'role'> | null; error: Error | null }>;
  }

  async updateProfile(userId: string, data: {
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    website?: string;
  }) {
    return this.client
      .from('profiles')
      .update(data)
      .eq('id', userId) as any as Promise<{ error: Error | null }>;
  }
}

/**
 * Type-safe category queries
 */
export class CategoryQueries {
  constructor(private client: SupabaseClient) {}

  async getCategoryBySlug(slug: string) {
    return this.client
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single() as any as Promise<{ data: Category | null; error: Error | null }>;
  }

  async getCategoryById(id: string) {
    return this.client
      .from('categories')
      .select('*')
      .eq('id', id)
      .single() as any as Promise<{ data: { id: string } | null; error: Error | null }>;
  }

  async getAllCategories() {
    return this.client
      .from('categories')
      .select('*')
      .order('name') as any as Promise<{ data: Category[] | null; error: Error | null }>;
  }
}

/**
 * Type-safe RPC queries
 */
export class RPCQueries {
  constructor(private client: SupabaseClient) {}

  async incrementViewCount(threadId: string) {
    return this.client
      .rpc('increment_view_count', { p_thread_id: threadId }) as any as Promise<{ error: Error | null }>;
  }

  async incrementThreadViewCount(threadId: string) {
    return this.client
      .rpc('increment_thread_view_count', { thread_id: threadId }) as any as Promise<{ error: Error | null }>;
  }
}

/**
 * Type-safe like queries
 */
export class LikeQueries {
  constructor(private client: SupabaseClient) {}

  async getThreadLike(threadId: string, userId: string) {
    return this.client
      .from('thread_likes')
      .select('id')
      .eq('thread_id', threadId)
      .eq('user_id', userId)
      .single() as any as Promise<{ data: { id: string } | null; error: Error | null }>;
  }

  async createThreadLike(threadId: string, userId: string) {
    return this.client
      .from('thread_likes')
      .insert({ thread_id: threadId, user_id: userId }) as any as Promise<{ error: Error | null }>;
  }

  async deleteThreadLike(likeId: string) {
    return this.client
      .from('thread_likes')
      .delete()
      .eq('id', likeId) as any as Promise<{ error: Error | null }>;
  }
}

/**
 * Type-safe tag queries
 */
export class TagQueries {
  constructor(private client: SupabaseClient) {}

  async createThreadTags(threadId: string, tags: string[]) {
    const tagInserts = tags.map(tag => ({
      thread_id: threadId,
      tag,
    }));

    return this.client
      .from('thread_tags')
      .insert(tagInserts) as any as Promise<{ error: Error | null }>;
  }
}

/**
 * Factory function to create typed query helpers
 */
export function createTypedQueries(client: SupabaseClient) {
  return {
    threads: new ThreadQueries(client),
    profiles: new ProfileQueries(client),
    categories: new CategoryQueries(client),
    rpc: new RPCQueries(client),
    likes: new LikeQueries(client),
    tags: new TagQueries(client),
  };
}
