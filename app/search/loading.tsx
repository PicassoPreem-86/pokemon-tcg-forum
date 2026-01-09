/**
 * Search Page Loading State
 * Displayed while search results are loading
 */

import { Search } from 'lucide-react';

export default function SearchLoading() {
  return (
    <div className="search-page">
      {/* Search Header */}
      <div className="search-header">
        <h1 className="search-title">
          <Search size={28} />
          Search
        </h1>

        <div className="search-form">
          <div className="search-input-wrapper">
            <Search size={20} className="search-input-icon" />
            <div className="search-input bg-[var(--bg-tertiary)] animate-pulse h-12 rounded-lg" />
          </div>
          <div className="btn btn-primary bg-[var(--bg-tertiary)] animate-pulse w-24 h-12" />
        </div>

        {/* Search Type Tabs Skeleton */}
        <div className="search-tabs">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 bg-[var(--bg-tertiary)] rounded w-32 animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="search-filters">
        <div className="h-10 bg-[var(--bg-tertiary)] rounded w-32 animate-pulse" />
      </div>

      {/* Results Skeleton */}
      <div className="search-results">
        <div className="search-section">
          <div className="h-7 bg-[var(--bg-tertiary)] rounded w-48 mb-4 animate-pulse" />

          <div className="search-thread-list space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="search-thread-item">
                <div className="search-thread-avatar">
                  <div className="w-11 h-11 bg-[var(--bg-tertiary)] rounded-full animate-pulse" />
                </div>
                <div className="search-thread-content flex-1 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 bg-[var(--bg-tertiary)] rounded w-16 animate-pulse" />
                    <div className="h-6 bg-[var(--bg-tertiary)] rounded flex-1 animate-pulse" />
                  </div>
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full animate-pulse" />
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4 animate-pulse" />
                  <div className="flex gap-3">
                    <div className="h-3 bg-[var(--bg-tertiary)] rounded w-24 animate-pulse" />
                    <div className="h-3 bg-[var(--bg-tertiary)] rounded w-32 animate-pulse" />
                  </div>
                </div>
                <div className="search-thread-stats space-y-2">
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-12 animate-pulse" />
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-12 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
