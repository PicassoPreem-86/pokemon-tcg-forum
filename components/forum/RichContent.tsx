'use client';

import React from 'react';
import Link from 'next/link';
import { parseContent, ParsedLine, ParsedSegment } from '@/lib/content-renderer';

interface RichContentProps {
  content: string;
  className?: string;
}

// Render a single segment
function RenderSegment({ segment }: { segment: ParsedSegment }) {
  switch (segment.type) {
    case 'bold':
      return <strong>{segment.content}</strong>;

    case 'italic':
      return <em>{segment.content}</em>;

    case 'bolditalic':
      return <strong><em>{segment.content}</em></strong>;

    case 'code':
      return <code className="inline-code">{segment.content}</code>;

    case 'link':
      // Check if it's an internal or external link
      const isExternal = segment.url?.startsWith('http');
      if (isExternal) {
        return (
          <a
            href={segment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="content-link external"
          >
            {segment.content}
          </a>
        );
      }
      return (
        <Link href={segment.url || '#'} className="content-link">
          {segment.content}
        </Link>
      );

    case 'mention':
      // Link to user profile
      const username = segment.content.slice(1); // Remove @
      return (
        <Link href={`/u/${username}`} className="content-mention">
          {segment.content}
        </Link>
      );

    case 'hashtag':
      // Link to tag page
      const tag = segment.content.slice(1); // Remove #
      return (
        <Link href={`/tag/${tag}`} className="content-hashtag">
          {segment.content}
        </Link>
      );

    case 'text':
    default:
      return <>{segment.content}</>;
  }
}

// Render segments as inline content
function RenderSegments({ segments }: { segments: ParsedSegment[] }) {
  return (
    <>
      {segments.map((segment, index) => (
        <RenderSegment key={index} segment={segment} />
      ))}
    </>
  );
}

// Render a single line
function RenderLine({ line, index }: { line: ParsedLine; index: number }) {
  switch (line.type) {
    case 'empty':
      return null;

    case 'hr':
      return <hr key={index} className="content-hr" />;

    case 'heading':
      const headingClass = `content-heading content-h${line.level}`;
      const headingContent = <RenderSegments segments={line.segments} />;
      switch (line.level) {
        case 1: return <h1 key={index} className={headingClass}>{headingContent}</h1>;
        case 3: return <h3 key={index} className={headingClass}>{headingContent}</h3>;
        case 4: return <h4 key={index} className={headingClass}>{headingContent}</h4>;
        default: return <h2 key={index} className={headingClass}>{headingContent}</h2>;
      }

    case 'quote':
      return (
        <blockquote key={index} className="content-quote" data-level={line.level}>
          <RenderSegments segments={line.segments} />
        </blockquote>
      );

    case 'listitem':
      return (
        <li key={index} className="content-list-item">
          <RenderSegments segments={line.segments} />
        </li>
      );

    case 'paragraph':
    default:
      // Check if segments have any content
      const hasContent = line.segments.some(s => s.content.trim());
      if (!hasContent) return null;

      return (
        <p key={index}>
          <RenderSegments segments={line.segments} />
        </p>
      );
  }
}

// Group consecutive list items
function groupLines(lines: ParsedLine[]): (ParsedLine | ParsedLine[])[] {
  const grouped: (ParsedLine | ParsedLine[])[] = [];
  let currentList: ParsedLine[] = [];

  for (const line of lines) {
    if (line.type === 'listitem') {
      currentList.push(line);
    } else {
      if (currentList.length > 0) {
        grouped.push(currentList);
        currentList = [];
      }
      grouped.push(line);
    }
  }

  // Don't forget remaining list items
  if (currentList.length > 0) {
    grouped.push(currentList);
  }

  return grouped;
}


export default function RichContent({ content, className = '' }: RichContentProps) {
  const lines = parseContent(content);
  const grouped = groupLines(lines);

  return (
    <div className={`rich-content ${className}`}>
      {grouped.map((item, index) => {
        // Check if it's a list (array of list items)
        if (Array.isArray(item)) {
          return (
            <ul key={index} className="content-list">
              {item.map((listItem, listIndex) => (
                <RenderLine key={listIndex} line={listItem} index={listIndex} />
              ))}
            </ul>
          );
        }

        return <RenderLine key={index} line={item} index={index} />;
      })}
    </div>
  );
}

// Simple variant for single-line content (no block elements)
export function RichContentInline({ content, className = '' }: RichContentProps) {
  const lines = parseContent(content);

  // Just render all segments inline
  const allSegments = lines.flatMap(line => line.segments);

  return (
    <span className={`rich-content-inline ${className}`}>
      <RenderSegments segments={allSegments} />
    </span>
  );
}
