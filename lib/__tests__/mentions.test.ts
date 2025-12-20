/**
 * Tests for mention parsing and validation
 * These tests verify the @mention functionality works correctly
 */

import { parseMentions, linkifyMentions, isUserMentioned } from '../mentions-utils';

describe('parseMentions', () => {
  test('should extract single mention', () => {
    const content = 'Hey @john, check this out!';
    const mentions = parseMentions(content);
    expect(mentions).toEqual(['john']);
  });

  test('should extract multiple mentions', () => {
    const content = 'Hey @john and @jane, what do you think @bob?';
    const mentions = parseMentions(content);
    expect(mentions).toEqual(['john', 'jane', 'bob']);
  });

  test('should extract mentions with underscores', () => {
    const content = '@john_doe and @jane_smith are great!';
    const mentions = parseMentions(content);
    expect(mentions).toEqual(['john_doe', 'jane_smith']);
  });

  test('should remove duplicate mentions (case-insensitive)', () => {
    const content = '@john @JOHN @John all the same!';
    const mentions = parseMentions(content);
    expect(mentions).toEqual(['john']);
  });

  test('should not extract mentions from code blocks', () => {
    const content = 'This is `@john` in code and this is @jane outside';
    const mentions = parseMentions(content);
    expect(mentions).toEqual(['jane']);
  });

  test('should limit to max mentions (10)', () => {
    const content = Array.from({ length: 15 }, (_, i) => `@user${i}`).join(' ');
    const mentions = parseMentions(content);
    expect(mentions.length).toBeLessThanOrEqual(10);
  });

  test('should handle empty content', () => {
    expect(parseMentions('')).toEqual([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(parseMentions(null as any)).toEqual([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(parseMentions(undefined as any)).toEqual([]);
  });

  test('should handle content with no mentions', () => {
    const content = 'This is just regular text without any mentions';
    const mentions = parseMentions(content);
    expect(mentions).toEqual([]);
  });

  test('should ignore invalid mention patterns', () => {
    const content = 'Email: test@example.com and @valid_user';
    const mentions = parseMentions(content);
    // Should extract both parts after @ if they match \w+
    expect(mentions).toContain('valid_user');
  });
});

describe('linkifyMentions', () => {
  test('should convert mentions to HTML links', () => {
    const content = 'Hey @john!';
    const result = linkifyMentions(content);
    expect(result).toContain('<a href="/u/john" class="mention">@john</a>');
  });

  test('should not linkify mentions in code blocks', () => {
    const content = 'Code: `@john` and real @jane';
    const result = linkifyMentions(content);
    expect(result).toContain('`@john`');
    expect(result).toContain('<a href="/u/jane" class="mention">@jane</a>');
  });

  test('should handle empty content', () => {
    expect(linkifyMentions('')).toBe('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(linkifyMentions(null as any)).toBe(null);
  });
});

describe('isUserMentioned', () => {
  test('should detect when user is mentioned', () => {
    const content = 'Hey @john, what do you think?';
    expect(isUserMentioned(content, 'john')).toBe(true);
  });

  test('should be case-insensitive', () => {
    const content = 'Hey @john!';
    expect(isUserMentioned(content, 'JOHN')).toBe(true);
    expect(isUserMentioned(content, 'John')).toBe(true);
  });

  test('should return false when user is not mentioned', () => {
    const content = 'Hey @jane!';
    expect(isUserMentioned(content, 'john')).toBe(false);
  });

  test('should handle empty content', () => {
    expect(isUserMentioned('', 'john')).toBe(false);
  });
});
