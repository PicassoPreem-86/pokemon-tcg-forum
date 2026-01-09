/**
 * Tag Queries
 * Real database queries for thread tags
 */

import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export interface TagWithCount {
  tag: string;
  count: number;
}

// Type for thread_tags query results
interface ThreadTagResult {
  tag: string;
}

// Type for thread ID query results
interface ThreadIdResult {
  id: string;
}

/**
 * Get most popular tags across all threads
 */
export const getPopularTags = cache(async (limit: number = 20): Promise<TagWithCount[]> => {
  try {
    const supabase = await createClient();

    // Query thread_tags and group by tag name, count occurrences
    const { data, error } = await supabase
      .from('thread_tags')
      .select('tag')
      .order('tag') as { data: ThreadTagResult[] | null; error: any };

    if (error) {
      console.error('Error fetching popular tags:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Count tag occurrences manually
    const tagCounts = data.reduce((acc: Record<string, number>, item) => {
      const tag = item.tag;
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort by count
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sortedTags;
  } catch (error) {
    console.error('Error in getPopularTags:', error);
    return [];
  }
});

/**
 * Search tags by prefix (for autocomplete)
 */
export const searchTags = cache(async (query: string, limit: number = 10): Promise<string[]> => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    const supabase = await createClient();

    // Search for tags that start with the query
    const { data, error } = await supabase
      .from('thread_tags')
      .select('tag')
      .ilike('tag', `${query}%`)
      .limit(limit) as { data: ThreadTagResult[] | null; error: any };

    if (error) {
      console.error('Error searching tags:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Remove duplicates
    const uniqueTags = [...new Set(data.map(item => item.tag))];

    return uniqueTags;
  } catch (error) {
    console.error('Error in searchTags:', error);
    return [];
  }
});

/**
 * Get tags for a specific thread
 */
export const getThreadTags = cache(async (threadId: string): Promise<string[]> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('thread_tags')
      .select('tag')
      .eq('thread_id', threadId) as { data: ThreadTagResult[] | null; error: any };

    if (error) {
      console.error('Error fetching thread tags:', error);
      return [];
    }

    return data?.map(item => item.tag) || [];
  } catch (error) {
    console.error('Error in getThreadTags:', error);
    return [];
  }
});

/**
 * Get all unique tags (for tag cloud/listing)
 */
export const getAllTags = cache(async (): Promise<TagWithCount[]> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('thread_tags')
      .select('tag') as { data: ThreadTagResult[] | null; error: any };

    if (error) {
      console.error('Error fetching all tags:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Count tag occurrences
    const tagCounts = data.reduce((acc: Record<string, number>, item) => {
      const tag = item.tag;
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort alphabetically
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag));

    return sortedTags;
  } catch (error) {
    console.error('Error in getAllTags:', error);
    return [];
  }
});

/**
 * Get trending tags (most used in last 7 days)
 */
export const getTrendingTags = cache(async (limit: number = 10): Promise<TagWithCount[]> => {
  try {
    const supabase = await createClient();

    // Get tags from threads created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentThreads, error: threadsError } = await supabase
      .from('threads')
      .select('id')
      .gte('created_at', sevenDaysAgo.toISOString()) as { data: ThreadIdResult[] | null; error: any };

    if (threadsError || !recentThreads || recentThreads.length === 0) {
      return [];
    }

    const threadIds = recentThreads.map(t => t.id);

    const { data, error } = await supabase
      .from('thread_tags')
      .select('tag')
      .in('thread_id', threadIds) as { data: ThreadTagResult[] | null; error: any };

    if (error) {
      console.error('Error fetching trending tags:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Count tag occurrences
    const tagCounts = data.reduce((acc: Record<string, number>, item) => {
      const tag = item.tag;
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort by count
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sortedTags;
  } catch (error) {
    console.error('Error in getTrendingTags:', error);
    return [];
  }
});
