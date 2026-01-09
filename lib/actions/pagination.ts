'use server';

import { createClient } from '@/lib/supabase/server';
import { createTypedQueries } from '@/lib/supabase/typed-queries';
import type { Thread } from '@/lib/supabase/database.types';

/**
 * Result type for paginated thread fetching
 */
export interface PaginatedThreadsResult {
  success: boolean;
  threads: Thread[];
  hasMore: boolean;
  nextCursor: string | null;
  error?: string;
}

/**
 * Fetch paginated threads
 * @param cursor Optional cursor for pagination
 * @param limit Number of threads to fetch (default: 20)
 * @param categoryId Optional category filter
 */
export async function fetchPaginatedThreads(
  cursor: string | null = null,
  limit = 20,
  categoryId?: string
): Promise<PaginatedThreadsResult> {
  try {
    const supabase = await createClient();
    const queries = createTypedQueries(supabase);

    const result = await queries.threads.getThreadsPaginated(limit, cursor, categoryId);

    if (result.error) {
      console.error('Pagination error:', result.error);
      return {
        success: false,
        threads: [],
        hasMore: false,
        nextCursor: null,
        error: 'Failed to load threads',
      };
    }

    return {
      success: true,
      threads: result.data || [],
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    };
  } catch (error) {
    console.error('Unexpected pagination error:', error);
    return {
      success: false,
      threads: [],
      hasMore: false,
      nextCursor: null,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Fetch paginated threads for a specific category
 * @param categorySlug Category slug
 * @param cursor Optional cursor for pagination
 * @param limit Number of threads to fetch (default: 20)
 */
export async function fetchCategoryThreads(
  categorySlug: string,
  cursor: string | null = null,
  limit = 20
): Promise<PaginatedThreadsResult> {
  try {
    const supabase = await createClient();
    const queries = createTypedQueries(supabase);

    // Get category ID from slug
    const { data: category, error: categoryError } = await queries.categories.getCategoryBySlug(categorySlug);

    if (categoryError || !category) {
      return {
        success: false,
        threads: [],
        hasMore: false,
        nextCursor: null,
        error: 'Category not found',
      };
    }

    const result = await queries.threads.getThreadsPaginated(limit, cursor, category.id);

    if (result.error) {
      console.error('Category pagination error:', result.error);
      return {
        success: false,
        threads: [],
        hasMore: false,
        nextCursor: null,
        error: 'Failed to load category threads',
      };
    }

    return {
      success: true,
      threads: result.data || [],
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    };
  } catch (error) {
    console.error('Unexpected category pagination error:', error);
    return {
      success: false,
      threads: [],
      hasMore: false,
      nextCursor: null,
      error: 'An unexpected error occurred',
    };
  }
}
