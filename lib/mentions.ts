'use server';

import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/supabase/database.types';
// Import utility functions from separate file (Next.js 15/16 'use server' files can only export async functions)
import { parseMentions } from '@/lib/mentions-utils';

// NOTE: Sync utility functions (parseMentions, linkifyMentions, isUserMentioned, etc.)
// must be imported directly from '@/lib/mentions-utils' by consumers.
// 'use server' files cannot re-export non-async functions.

/**
 * Validate which mentioned usernames actually exist in the database
 *
 * @param usernames - Array of usernames to validate (case-insensitive)
 * @returns Array of Profile objects for users that exist
 *
 * Implementation notes:
 * - Case-insensitive username matching
 * - Returns only valid, active user profiles
 * - Filters out any null results
 */
export async function validateMentions(usernames: string[]): Promise<Profile[]> {
  if (!usernames || usernames.length === 0) {
    return [];
  }

  try {
    const supabase = await createClient();

    // Build case-insensitive OR query for each username
    // We need to check each username individually with case-insensitive matching
    const lowerUsernames = usernames.map(u => u.toLowerCase());

    // Query profiles with case-insensitive username matching
    // Using ilike for case-insensitive pattern matching on each username
    const promises = lowerUsernames.map(username =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('profiles')
        .select('id, username, display_name, avatar_url, role')
        .ilike('username', username)
        .maybeSingle()
    );

    const results = await Promise.all(promises);

    // Extract data from results and filter out errors and nulls
    const profiles: Profile[] = [];
    for (const result of results) {
      if (result.data && !result.error) {
        profiles.push(result.data);
      }
    }

    return profiles;
  } catch (error) {
    console.error('[validateMentions] Unexpected error:', error);
    return [];
  }
}

/**
 * Extract mentions and validate them in one operation
 * Convenience function combining parseMentions and validateMentions
 *
 * @param content - The content to parse for mentions
 * @returns Array of Profile objects for valid mentioned users
 */
export async function extractAndValidateMentions(content: string): Promise<Profile[]> {
  const usernames = parseMentions(content);

  if (usernames.length === 0) {
    return [];
  }

  return validateMentions(usernames);
}

/**
 * Search for users by username prefix for @mention autocomplete
 * Returns up to 5 matching users, sorted by username
 *
 * @param query - The username prefix to search for (without @)
 * @param excludeUserId - Optional user ID to exclude from results (e.g., current user)
 * @returns Array of matching profiles with basic info
 */
export async function searchUsersForMention(
  query: string,
  excludeUserId?: string
): Promise<Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>[]> {
  if (!query || query.length < 1) {
    return [];
  }

  // Limit query to prevent abuse
  const sanitizedQuery = query.slice(0, 20).toLowerCase();

  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let queryBuilder = (supabase as any)
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .ilike('username', `${sanitizedQuery}%`)
      .order('username')
      .limit(5);

    // Exclude current user if provided
    if (excludeUserId) {
      queryBuilder = queryBuilder.neq('id', excludeUserId);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('[searchUsersForMention] Query error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[searchUsersForMention] Unexpected error:', error);
    return [];
  }
}
