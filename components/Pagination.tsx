/**
 * Pagination Component
 * Cursor-based pagination for infinite scroll or load more button
 */

'use client';

import { ChevronRight } from 'lucide-react';
import { useState, useTransition } from 'react';

interface PaginationProps {
  hasMore: boolean;
  nextCursor: string | null;
  onLoadMore: (cursor: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function Pagination({
  hasMore,
  nextCursor,
  onLoadMore,
  isLoading = false,
  className = '',
}: PaginationProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleLoadMore = () => {
    if (!nextCursor || isPending || isLoading) return;

    setError(null);
    startTransition(async () => {
      try {
        await onLoadMore(nextCursor);
      } catch (err) {
        console.error('Pagination error:', err);
        setError('Failed to load more items');
      }
    });
  };

  if (!hasMore) {
    return (
      <div className={`pagination-end ${className}`}>
        <p className="text-[var(--text-secondary)] text-sm">
          You&apos;ve reached the end
        </p>
      </div>
    );
  }

  return (
    <div className={`pagination ${className}`}>
      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}

      <button
        onClick={handleLoadMore}
        disabled={isPending || isLoading}
        className="btn-secondary"
        aria-label="Load more"
      >
        {isPending || isLoading ? (
          <>
            <span className="loading-spinner" />
            Loading...
          </>
        ) : (
          <>
            Load More
            <ChevronRight size={16} />
          </>
        )}
      </button>
    </div>
  );
}

/**
 * Infinite Scroll Pagination
 * Automatically loads more when user scrolls near bottom
 */
interface InfiniteScrollPaginationProps {
  hasMore: boolean;
  nextCursor: string | null;
  onLoadMore: (cursor: string) => Promise<void>;
  threshold?: number; // pixels from bottom to trigger load
}

export function InfiniteScrollPagination({
  hasMore,
  nextCursor,
  onLoadMore,
  threshold = 500,
}: InfiniteScrollPaginationProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Use IntersectionObserver for infinite scroll
  const observerRef = (node: HTMLDivElement | null) => {
    if (!node || !hasMore || !nextCursor || isPending) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setError(null);
          startTransition(async () => {
            try {
              await onLoadMore(nextCursor);
            } catch (err) {
              console.error('Infinite scroll error:', err);
              setError('Failed to load more items');
            }
          });
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observer.observe(node);
    return () => observer.disconnect();
  };

  if (!hasMore) {
    return (
      <div className="pagination-end">
        <p className="text-[var(--text-secondary)] text-sm">
          You&apos;ve reached the end
        </p>
      </div>
    );
  }

  return (
    <div ref={observerRef} className="pagination-infinite">
      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}

      {isPending && (
        <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
          <span className="loading-spinner" />
          Loading more...
        </div>
      )}
    </div>
  );
}
