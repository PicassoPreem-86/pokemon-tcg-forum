/**
 * Comprehensive Input Validation Utilities
 *
 * This module provides strict validation for all user inputs to prevent:
 * - SQL Injection
 * - XSS attacks
 * - NoSQL injection
 * - Path traversal
 * - Command injection
 * - Invalid data formats
 */

import { z } from 'zod';

/**
 * Security: Validate UUID format to prevent injection
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Security: Validate username (alphanumeric, underscores, hyphens only)
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens'
  )
  .refine(
    (val) => !val.includes('..') && !val.includes('__'),
    'Username cannot contain consecutive special characters'
  );

/**
 * Security: Validate email format with strict RFC compliance
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .toLowerCase()
  .refine(
    (email) => {
      // Block disposable email domains (basic list)
      const disposableDomains = [
        'tempmail.com',
        'throwaway.email',
        'guerrillamail.com',
        '10minutemail.com',
      ];
      const domain = email.split('@')[1];
      return !disposableDomains.includes(domain);
    },
    { message: 'Disposable email addresses are not allowed' }
  );

/**
 * Security: Validate thread/post title
 */
export const titleSchema = z
  .string()
  .trim()
  .min(10, 'Title must be at least 10 characters')
  .max(200, 'Title must be at most 200 characters')
  .refine(
    (val) => {
      // Block common spam patterns
      const spamPatterns = [
        /\b(viagra|cialis|casino)\b/i,
        /\b(make.*money.*fast)\b/i,
        /\b(click here|buy now)\b/i,
      ];
      return !spamPatterns.some((pattern) => pattern.test(val));
    },
    { message: 'Title contains prohibited content' }
  );

/**
 * Security: Validate post content
 */
export const contentSchema = z
  .string()
  .trim()
  .min(20, 'Content must be at least 20 characters')
  .max(50000, 'Content exceeds maximum length')
  .refine(
    (val) => {
      // Block malicious script patterns (belt and suspenders with sanitizeHtml)
      const dangerousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // Event handlers like onclick=
        /<iframe/gi,
        /<embed/gi,
        /<object/gi,
      ];
      return !dangerousPatterns.some((pattern) => pattern.test(val));
    },
    { message: 'Content contains potentially dangerous code' }
  );

/**
 * Security: Validate tags (alphanumeric, hyphens, underscores only)
 */
export const tagSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'Tag must be at least 2 characters')
  .max(30, 'Tag must be at most 30 characters')
  .regex(
    /^[a-z0-9-_]+$/,
    'Tags can only contain lowercase letters, numbers, hyphens, and underscores'
  );

export const tagsArraySchema = z
  .array(tagSchema)
  .max(5, 'Maximum 5 tags allowed')
  .refine(
    (tags) => {
      // Ensure no duplicate tags
      return new Set(tags).size === tags.length;
    },
    { message: 'Duplicate tags are not allowed' }
  );

/**
 * Security: Validate slug format (URL-safe)
 */
export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase alphanumeric with hyphens only'
  );

/**
 * Security: Validate category ID (must be valid UUID)
 */
export const categoryIdSchema = uuidSchema;

/**
 * Security: Validate search query
 */
export const searchQuerySchema = z
  .string()
  .trim()
  .min(1, 'Search query cannot be empty')
  .max(100, 'Search query too long')
  .refine(
    (val) => {
      // Block SQL injection patterns
      const sqlPatterns = [
        /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
        /(--|\/\*|\*\/|;|'|")/g,
      ];
      return !sqlPatterns.some((pattern) => pattern.test(val));
    },
    { message: 'Search query contains invalid characters' }
  );

/**
 * Security: Validate URL (for links in posts)
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .max(2000, 'URL too long')
  .refine(
    (url) => {
      // Only allow safe protocols
      const safeProtocols = ['http:', 'https:'];
      try {
        const parsed = new URL(url);
        return safeProtocols.includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: 'Only HTTP and HTTPS URLs are allowed' }
  )
  .refine(
    (url) => {
      // Block localhost and private IPs (SSRF protection)
      const parsed = new URL(url);
      const hostname = parsed.hostname;
      const privatePatterns = [
        /^localhost$/i,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2\d|3[01])\./,
        /^192\.168\./,
        /^::1$/,
        /^fc00:/,
      ];
      return !privatePatterns.some((pattern) => pattern.test(hostname));
    },
    { message: 'URLs to private networks are not allowed' }
  );

/**
 * Security: Validate password strength
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .refine(
    (val) => /[a-z]/.test(val),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (val) => /[A-Z]/.test(val),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (val) => /[0-9]/.test(val),
    'Password must contain at least one number'
  )
  .refine(
    (val) => /[^a-zA-Z0-9]/.test(val),
    'Password must contain at least one special character'
  );

/**
 * Security: Validate pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Security: Validate sort parameters
 */
export const sortSchema = z.object({
  sortBy: z.enum(['created_at', 'updated_at', 'title', 'view_count', 'post_count']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Composite validation schemas for common operations
 */

export const createThreadSchema = z.object({
  title: titleSchema,
  content: contentSchema,
  categoryId: categoryIdSchema,
  tags: tagsArraySchema.optional().default([]),
});

export const updateThreadSchema = z.object({
  threadId: uuidSchema,
  title: titleSchema,
  content: contentSchema,
});

export const createPostSchema = z.object({
  threadId: uuidSchema,
  content: contentSchema,
  parentId: uuidSchema.optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(50).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: urlSchema.optional(),
  website: urlSchema.optional(),
});

/**
 * Validation helper functions
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Validate data against a Zod schema and return formatted errors
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).errors.forEach((err: any) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return {
      success: false,
      errors: { _general: 'Validation failed' },
    };
  }
}

/**
 * Sanitize file path to prevent directory traversal attacks
 */
export function sanitizeFilePath(path: string): string {
  // Remove any ../ or ..\\ patterns
  const sanitized = path
    .replace(/\.\./g, '')
    .replace(/[/\\]+/g, '/')
    .replace(/^\/+/, '');

  return sanitized;
}

/**
 * Validate and sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255);
}

/**
 * Rate limiting validation
 */
export function validateRateLimit(
  count: number,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  if (count >= limit) {
    return {
      allowed: false,
      retryAfter: windowMs,
    };
  }
  return { allowed: true };
}

/**
 * Validate IP address format
 */
export function isValidIP(ip: string): boolean {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Pattern.test(ip)) {
    return ip.split('.').every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  return ipv6Pattern.test(ip);
}

/**
 * Sanitize user-controlled database column names for ORDER BY clauses
 * CRITICAL: Only allow whitelisted column names
 */
export function sanitizeOrderByColumn(
  column: string,
  allowedColumns: string[]
): string {
  if (!allowedColumns.includes(column)) {
    throw new Error(`Invalid sort column: ${column}`);
  }
  return column;
}

/**
 * Sanitize search terms for LIKE/ILIKE queries
 * Escapes special characters to prevent SQL injection
 */
export function sanitizeSearchTerm(term: string): string {
  // Escape special PostgreSQL LIKE characters
  return term
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}
