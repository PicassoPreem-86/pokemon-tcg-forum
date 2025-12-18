// Content rendering utilities for forum posts and replies
// Supports markdown-like syntax: **bold**, *italic*, [links](url), > quotes, etc.

export interface ParsedSegment {
  type: 'text' | 'bold' | 'italic' | 'bolditalic' | 'link' | 'code' | 'mention' | 'hashtag';
  content: string;
  url?: string; // For links
}

export interface ParsedLine {
  type: 'paragraph' | 'quote' | 'heading' | 'listitem' | 'codeblock' | 'hr' | 'empty';
  segments: ParsedSegment[];
  level?: number; // For headings (1-3) or quote nesting
  raw?: string; // Original text for code blocks
}

// Parse inline formatting (bold, italic, links, etc.)
export function parseInlineFormatting(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];

  // Combined regex for all inline patterns
  // Order matters: bolditalic before bold/italic
  // Use negative lookbehind/lookahead to prevent italic matching inside bold
  const patterns = [
    { regex: /\*\*\*(.+?)\*\*\*/g, type: 'bolditalic' as const },
    { regex: /\*\*(.+?)\*\*/g, type: 'bold' as const },
    { regex: /(?<!\*)\*([^*]+)\*(?!\*)/g, type: 'italic' as const },
    { regex: /(?<!_)_([^_]+)_(?!_)/g, type: 'italic' as const },
    { regex: /`([^`]+)`/g, type: 'code' as const },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' as const },
    { regex: /@(\w+)/g, type: 'mention' as const },
    { regex: /#(\w+)/g, type: 'hashtag' as const },
  ];

  // Simple approach: process text character by character with state
  let remaining = text;
  let lastIndex = 0;

  // Build a list of all matches with their positions
  interface Match {
    start: number;
    end: number;
    type: ParsedSegment['type'];
    content: string;
    url?: string;
  }

  const allMatches: Match[] = [];

  // Find all matches for each pattern
  for (const { regex, type } of patterns) {
    const re = new RegExp(regex.source, 'g');
    let match;
    while ((match = re.exec(text)) !== null) {
      const matchObj: Match = {
        start: match.index,
        end: match.index + match[0].length,
        type,
        content: type === 'link' ? match[1] : (type === 'mention' || type === 'hashtag' ? match[1] : match[1]),
        url: type === 'link' ? match[2] : undefined,
      };

      // For mentions and hashtags, include the @ or # in display
      if (type === 'mention') {
        matchObj.content = '@' + match[1];
      } else if (type === 'hashtag') {
        matchObj.content = '#' + match[1];
      }

      allMatches.push(matchObj);
    }
  }

  // Sort by start position, preferring longer matches at same position
  allMatches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  // Remove overlapping matches (keep first/longer one)
  const filteredMatches: Match[] = [];
  let lastEnd = 0;
  for (const match of allMatches) {
    if (match.start >= lastEnd) {
      filteredMatches.push(match);
      lastEnd = match.end;
    }
  }

  // Build segments
  let pos = 0;
  for (const match of filteredMatches) {
    // Add text before this match
    if (match.start > pos) {
      segments.push({
        type: 'text',
        content: text.slice(pos, match.start),
      });
    }

    // Add the match
    segments.push({
      type: match.type,
      content: match.content,
      url: match.url,
    });

    pos = match.end;
  }

  // Add remaining text
  if (pos < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(pos),
    });
  }

  // If no segments, return the whole text as a text segment
  if (segments.length === 0) {
    segments.push({ type: 'text', content: text });
  }

  return segments;
}

// Parse a single line to determine its type
export function parseLine(line: string): ParsedLine {
  const trimmed = line.trim();

  // Empty line
  if (!trimmed) {
    return { type: 'empty', segments: [] };
  }

  // Horizontal rule
  if (/^[-*_]{3,}$/.test(trimmed)) {
    return { type: 'hr', segments: [] };
  }

  // Headings
  const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
  if (headingMatch) {
    return {
      type: 'heading',
      level: headingMatch[1].length,
      segments: parseInlineFormatting(headingMatch[2]),
    };
  }

  // Quote
  if (trimmed.startsWith('>')) {
    // Count nesting level
    let level = 0;
    let content = trimmed;
    while (content.startsWith('>')) {
      level++;
      content = content.slice(1).trim();
    }
    return {
      type: 'quote',
      level,
      segments: parseInlineFormatting(content),
    };
  }

  // List item
  const listMatch = trimmed.match(/^[-*•]\s+(.+)$/);
  if (listMatch) {
    return {
      type: 'listitem',
      segments: parseInlineFormatting(listMatch[1]),
    };
  }

  // Numbered list
  const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
  if (numberedMatch) {
    return {
      type: 'listitem',
      segments: parseInlineFormatting(numberedMatch[1]),
    };
  }

  // Regular paragraph
  return {
    type: 'paragraph',
    segments: parseInlineFormatting(trimmed),
  };
}

// Parse full content into lines
export function parseContent(content: string): ParsedLine[] {
  const lines = content.split('\n');
  return lines.map(parseLine);
}

// Helper to insert formatting into textarea
export function insertFormatting(
  textarea: HTMLTextAreaElement,
  format: 'bold' | 'italic' | 'link' | 'quote' | 'code' | 'heading'
): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.slice(start, end);

  let newText = '';
  let cursorOffset = 0;

  switch (format) {
    case 'bold':
      if (selectedText) {
        newText = text.slice(0, start) + `**${selectedText}**` + text.slice(end);
        cursorOffset = end + 4;
      } else {
        newText = text.slice(0, start) + '**text**' + text.slice(end);
        cursorOffset = start + 2;
      }
      break;

    case 'italic':
      if (selectedText) {
        newText = text.slice(0, start) + `*${selectedText}*` + text.slice(end);
        cursorOffset = end + 2;
      } else {
        newText = text.slice(0, start) + '*text*' + text.slice(end);
        cursorOffset = start + 1;
      }
      break;

    case 'link':
      if (selectedText) {
        newText = text.slice(0, start) + `[${selectedText}](url)` + text.slice(end);
        cursorOffset = end + 3;
      } else {
        newText = text.slice(0, start) + '[link text](url)' + text.slice(end);
        cursorOffset = start + 1;
      }
      break;

    case 'quote':
      if (selectedText) {
        const quotedLines = selectedText.split('\n').map(line => `> ${line}`).join('\n');
        newText = text.slice(0, start) + quotedLines + text.slice(end);
        cursorOffset = start + quotedLines.length;
      } else {
        newText = text.slice(0, start) + '> ' + text.slice(end);
        cursorOffset = start + 2;
      }
      break;

    case 'code':
      if (selectedText) {
        newText = text.slice(0, start) + `\`${selectedText}\`` + text.slice(end);
        cursorOffset = end + 2;
      } else {
        newText = text.slice(0, start) + '`code`' + text.slice(end);
        cursorOffset = start + 1;
      }
      break;

    case 'heading':
      // Add heading to start of current line
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      newText = text.slice(0, lineStart) + '## ' + text.slice(lineStart);
      cursorOffset = start + 3;
      break;

    default:
      return text;
  }

  // Set the new text
  textarea.value = newText;

  // Trigger input event so React state updates
  const event = new Event('input', { bubbles: true });
  textarea.dispatchEvent(event);

  // Set cursor position
  textarea.setSelectionRange(cursorOffset, cursorOffset);
  textarea.focus();

  return newText;
}

// Format content for display (convert markdown to HTML-safe structure)
export function formatContentPreview(content: string, maxLength: number = 200): string {
  // Strip formatting for preview
  let stripped = content
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/^[-*•]\s*/gm, '')
    .replace(/^\d+[.)]\s*/gm, '');

  if (stripped.length > maxLength) {
    stripped = stripped.slice(0, maxLength) + '...';
  }

  return stripped;
}
