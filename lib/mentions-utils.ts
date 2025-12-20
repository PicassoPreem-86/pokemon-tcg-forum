// Mention utility functions - separate file because 'use server' files can only export async functions
// This file contains synchronous utility functions for parsing and formatting @mentions

/**
 * Maximum number of mentions allowed per post to prevent abuse
 */
export const MAX_MENTIONS_PER_POST = 10;

/**
 * Regular expression to match @username mentions
 * Matches @username where username can contain letters, numbers, and underscores
 */
export const MENTION_REGEX = /@(\w+)/g;

/**
 * Regular expression to detect if text is inside a code block
 * Used to exclude mentions from code blocks
 */
export const CODE_BLOCK_REGEX = /`[^`]*`/g;

/**
 * Extract all @username mentions from content
 *
 * @param content - The content to parse for mentions
 * @returns Array of unique usernames (without @ symbol)
 *
 * Edge cases handled:
 * - Mentions inside code blocks are excluded
 * - Duplicates are removed (case-insensitive)
 * - Limited to MAX_MENTIONS_PER_POST
 * - Usernames with underscores are supported
 */
export function parseMentions(content: string): string[] {
  if (!content || typeof content !== 'string') {
    return [];
  }

  // Remove code blocks to prevent mentions inside code from being processed
  let sanitizedContent = content;
  const codeBlocks: string[] = [];

  // Replace code blocks with placeholders
  sanitizedContent = sanitizedContent.replace(CODE_BLOCK_REGEX, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Extract all @username mentions
  const mentions = new Set<string>();
  let match;

  // Reset regex lastIndex to ensure clean matching
  MENTION_REGEX.lastIndex = 0;

  while ((match = MENTION_REGEX.exec(sanitizedContent)) !== null) {
    const username = match[1];

    // Validate username (alphanumeric and underscores only)
    if (/^\w+$/.test(username)) {
      // Store lowercase for case-insensitive deduplication
      mentions.add(username.toLowerCase());
    }

    // Prevent infinite loops in malformed regex
    if (mentions.size >= MAX_MENTIONS_PER_POST) {
      break;
    }
  }

  // Convert Set to Array and limit to max mentions
  return Array.from(mentions).slice(0, MAX_MENTIONS_PER_POST);
}

/**
 * Convert @username mentions to clickable links in HTML content
 *
 * @param content - The content with @mentions
 * @returns Content with @mentions wrapped in HTML anchor tags
 *
 * Note: This is a fallback for any content not processed by RichContent component
 * The primary rendering happens in RichContent.tsx
 */
export function linkifyMentions(content: string): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  // Avoid linkifying mentions inside code blocks
  const codeBlocks: string[] = [];
  let result = content;

  // Temporarily replace code blocks
  result = result.replace(CODE_BLOCK_REGEX, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Replace @username with clickable links
  result = result.replace(MENTION_REGEX, (match, username) => {
    return `<a href="/u/${username}" class="mention">@${username}</a>`;
  });

  // Restore code blocks
  result = result.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
    return codeBlocks[parseInt(index, 10)] || match;
  });

  return result;
}

/**
 * Check if a username is mentioned in content (case-insensitive)
 *
 * @param content - The content to search
 * @param username - The username to look for
 * @returns True if username is mentioned
 */
export function isUserMentioned(content: string, username: string): boolean {
  const mentions = parseMentions(content);
  return mentions.some(m => m.toLowerCase() === username.toLowerCase());
}
