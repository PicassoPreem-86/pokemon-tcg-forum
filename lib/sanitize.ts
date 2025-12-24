/**
 * HTML Sanitization Utility
 *
 * Provides secure HTML sanitization using regex-based approach for server compatibility.
 * Works in both client and server environments without jsdom dependency.
 *
 * SECURITY: All user-generated HTML content MUST be sanitized before:
 * 1. Rendering in the browser (dangerouslySetInnerHTML)
 * 2. Storing in the database (server actions)
 */

// Allowed HTML tags (whitelist approach)
const ALLOWED_TAGS = new Set([
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
  // Spans and divs for structure
  'span', 'div',
]);

// Allowed attributes per tag
const ALLOWED_ATTRS = new Set([
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
]);

// Dangerous tags that should be completely removed with content
const DANGEROUS_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'applet', 'form', 'noscript'];

// Dangerous attribute patterns
const DANGEROUS_ATTR_PATTERNS = [
  /^on\w+/i,        // Event handlers: onclick, onload, etc.
  /^javascript:/i,   // JavaScript URLs
  /^data:/i,         // Data URIs (except safe ones)
  /^vbscript:/i,     // VBScript
];

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Check if an attribute value is safe
 */
function isSafeAttrValue(name: string, value: string): boolean {
  const lowerValue = value.toLowerCase().trim();

  // Block dangerous URL schemes
  if (name === 'href' || name === 'src') {
    if (
      lowerValue.startsWith('javascript:') ||
      lowerValue.startsWith('vbscript:') ||
      lowerValue.startsWith('data:text/html')
    ) {
      return false;
    }
  }

  // Block event handlers
  for (const pattern of DANGEROUS_ATTR_PATTERNS) {
    if (pattern.test(name)) {
      return false;
    }
  }

  return true;
}

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
    let result = html;

    // Step 1: Remove dangerous tags with their content
    for (const tag of DANGEROUS_TAGS) {
      const regex = new RegExp(`<${tag}[^>]*>.*?<\\/${tag}>`, 'gis');
      result = result.replace(regex, '');
      // Also remove self-closing versions
      const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/?>`, 'gi');
      result = result.replace(selfClosingRegex, '');
    }

    // Step 2: Process remaining tags - keep allowed ones, escape others
    result = result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\s*([^>]*)?\/?>/gi, (match, tagName, attrs = '') => {
      const lowerTag = tagName.toLowerCase();

      // If tag is not allowed, escape it
      if (!ALLOWED_TAGS.has(lowerTag)) {
        return escapeHtml(match);
      }

      // Tag is allowed, process attributes
      const cleanAttrs: string[] = [];
      const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*))/gi;
      let attrMatch;

      while ((attrMatch = attrRegex.exec(attrs)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        const attrValue = attrMatch[2] || attrMatch[3] || attrMatch[4] || '';

        // Only keep allowed attributes with safe values
        if (ALLOWED_ATTRS.has(attrName) && isSafeAttrValue(attrName, attrValue)) {
          cleanAttrs.push(`${attrName}="${escapeHtml(attrValue)}"`);
        }
      }

      // Reconstruct tag
      const isClosing = match.startsWith('</');
      const isSelfClosing = match.endsWith('/>') || ['br', 'img', 'hr'].includes(lowerTag);

      if (isClosing) {
        return `</${lowerTag}>`;
      }

      const attrStr = cleanAttrs.length > 0 ? ' ' + cleanAttrs.join(' ') : '';
      return isSelfClosing ? `<${lowerTag}${attrStr} />` : `<${lowerTag}${attrStr}>`;
    });

    // Step 3: Post-processing - ensure external links have security attributes
    result = result.replace(
      /<a\s+([^>]*href\s*=\s*["']https?:\/\/[^"']+["'][^>]*)>/gi,
      (match, attrs) => {
        // Add target and rel if not present
        let newAttrs = attrs;
        if (!/target\s*=/i.test(newAttrs)) {
          newAttrs += ' target="_blank"';
        }
        if (!/rel\s*=/i.test(newAttrs)) {
          newAttrs += ' rel="noopener noreferrer"';
        }
        return `<a ${newAttrs}>`;
      }
    );

    return result;
  } catch (error) {
    // If sanitization fails for any reason, escape everything (fail-safe)
    console.error('HTML sanitization error:', error);
    return escapeHtml(html);
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
  return markdown
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
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

  // Remove all tags and decode entities
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
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
