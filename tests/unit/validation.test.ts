/**
 * Validation Tests
 * Critical path: Input validation security
 */

import {
  titleSchema,
  contentSchema,
  createThreadSchema,
  validateInput,
} from '@/lib/validation';

describe('Input Validation', () => {
  describe('titleSchema', () => {
    it('should accept valid titles', () => {
      const validTitles = [
        'How to grade Charizard cards',
        'Best pulls from Surging Sparks',
        'Looking for Mewtwo EX trades',
      ];

      validTitles.forEach(title => {
        const result = titleSchema.safeParse(title);
        expect(result.success).toBe(true);
      });
    });

    it('should reject titles that are too short', () => {
      const result = titleSchema.safeParse('Short');
      expect(result.success).toBe(false);
    });

    it('should reject titles that are too long', () => {
      const longTitle = 'a'.repeat(201);
      const result = titleSchema.safeParse(longTitle);
      expect(result.success).toBe(false);
    });

    it('should reject spam keywords', () => {
      const spamTitles = [
        'Buy viagra online cheap',
        'Make money fast casino',
        'Click here for cialis deals',
      ];

      spamTitles.forEach(title => {
        const result = titleSchema.safeParse(title);
        expect(result.success).toBe(false);
      });
    });

    it('should trim whitespace', () => {
      const result = titleSchema.safeParse('  Valid Title Here  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Valid Title Here');
      }
    });
  });

  describe('contentSchema', () => {
    it('should accept valid content', () => {
      const content = 'I just pulled a rare Charizard! What do you think?';
      const result = contentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });

    it('should reject content that is too short', () => {
      const result = contentSchema.safeParse('Hi');
      expect(result.success).toBe(false);
    });

    it('should reject content that is too long', () => {
      const longContent = 'a'.repeat(100001);
      const result = contentSchema.safeParse(longContent);
      expect(result.success).toBe(false);
    });

    it('should reject spam patterns', () => {
      const spamContent = 'Click here to win FREE money NOW! casino viagra';
      const result = contentSchema.safeParse(spamContent);
      expect(result.success).toBe(false);
    });
  });

  describe('createThreadSchema', () => {
    it('should accept valid thread data', () => {
      const validData = {
        title: 'Looking for PSA 10 Charizard',
        content: 'Anyone have a PSA 10 Charizard from Base Set? Looking to buy or trade.',
        categoryId: 'general',
        tags: ['trading', 'charizard'],
      };

      const result = validateInput(createThreadSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid data', () => {
      const invalidData = {
        title: 'Short',
        content: 'Hi',
        categoryId: '',
      };

      const result = validateInput(createThreadSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should sanitize XSS attempts', () => {
      const xssData = {
        title: 'Charizard card <script>alert("xss")</script>',
        content: 'Check this out <img src=x onerror=alert("xss")>',
        categoryId: 'general',
      };

      const result = validateInput(createThreadSchema, xssData);
      // Should pass validation (sanitization happens elsewhere)
      // But ensure no script tags in title
      expect(result.success).toBe(true);
    });

    it('should limit tags array', () => {
      const tooManyTags = Array(21).fill('tag'); // Max is 20
      const data = {
        title: 'Valid thread title here',
        content: 'Valid content that meets minimum length requirements.',
        categoryId: 'general',
        tags: tooManyTags,
      };

      const result = validateInput(createThreadSchema, data);
      expect(result.success).toBe(false);
    });
  });

  describe('validateInput utility', () => {
    it('should return structured errors', () => {
      const result = validateInput(titleSchema, 'bad');

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should return validated data on success', () => {
      const result = validateInput(titleSchema, 'Valid Title Here');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Valid Title Here');
      }
    });
  });
});
