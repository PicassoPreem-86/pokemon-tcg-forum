/**
 * HTML Sanitization Utility
 *
 * Provides secure HTML sanitization using DOMPurify to prevent XSS attacks.
 * Works in both client and server environments (isomorphic).
 *
 * SECURITY: All user-generated HTML content MUST be sanitized before:
 * 1. Rendering in the browser (dangerouslySetInnerHTML)
 * 2. Storing in the database (server actions)
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuration for allowed HTML tags and attributes
 *
 * This configuration follows a whitelist approach - only explicitly
 * allowed tags and attributes will be permitted. Everything else is stripped.
 */
const SANITIZE_CONFIG = {
  // Allowed HTML tags
  ALLOWED_TAGS: [
    // Text formatting
    'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins', 'sub', 'sup',
    // Links and images
    'a', 'img',
    // Lists
    'ul', 'ol', 'li',
    // Code
    'code', 'pre',
    // Quotes and blocks
    'blockquote',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Tables (for advanced formatting)
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    // Semantic elements
    'mark', 'abbr', 'cite', 'q', 'kbd', 'samp', 'var',
  ],

  // Allowed attributes per tag
  ALLOWED_ATTR: [
    // Links
    'href', 'target', 'rel',
    // Images
    'src', 'alt', 'width', 'height',
    // General
    'title', 'class', 'id',
    // Code blocks
    'lang',
    // Tables
    'colspan', 'rowspan',
  ],

  // Force all links to open in new tabs with security attributes
  ADD_ATTR: ['target', 'rel'],

  // Additional security measures
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'applet', 'form', 'input', 'button'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],

  // Keep HTML structure
  KEEP_CONTENT: true,

  // Return a DOM fragment in browser, HTML string in Node.js
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * @param html - Raw HTML string from user input
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script><p>Safe content</p>';
 * const safe = sanitizeHtml(userInput);
 * // Returns: '<p>Safe content</p>'
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    // Apply sanitization with our security configuration
    let sanitized = DOMPurify.sanitize(html, SANITIZE_CONFIG);

    // Post-processing: Ensure all external links have security attributes
    sanitized = sanitized.replace(
      /<a\s+href="(https?:\/\/[^"]+)"/gi,
      '<a href="$1" target="_blank" rel="noopener noreferrer"'
    );

    return sanitized;
  } catch (error) {
    // If sanitization fails for any reason, return empty string (fail-safe)
    console.error('HTML sanitization error:', error);
    return '';
  }
}

/**
 * Sanitize markdown-style content before converting to HTML
 *
 * This provides an extra layer of security by sanitizing the content
 * before any markdown-to-HTML conversion happens.
 *
 * @param markdown - Raw markdown/text content from user
 * @returns Sanitized text safe for markdown processing
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  // Remove any HTML tags that might be embedded in markdown
  // This prevents users from bypassing markdown parsing with raw HTML
  return markdown.replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove inline event handlers
    .replace(/javascript:/gi, ''); // Remove javascript: URLs
}

/**
 * Validate and sanitize URLs to prevent javascript: and data: URI attacks
 *
 * @param url - URL string to validate
 * @returns Safe URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return '';
  }

  // Only allow http, https, and relative URLs
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('#')
  ) {
    return '';
  }

  return url.trim();
}

/**
 * Strip all HTML tags from content, leaving only text
 *
 * Useful for creating excerpts or plaintext previews
 *
 * @param html - HTML string
 * @returns Plain text with HTML tags removed
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // First sanitize to ensure no dangerous content
  const sanitized = sanitizeHtml(html);

  // Then strip all tags
  return sanitized.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize and truncate HTML for excerpts
 *
 * @param html - HTML string
 * @param maxLength - Maximum length of excerpt
 * @returns Sanitized and truncated HTML
 */
export function createSafeExcerpt(html: string, maxLength: number = 200): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Strip HTML and truncate
  const plainText = stripHtml(html);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
}
