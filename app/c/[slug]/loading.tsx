/**
 * Category Page Loading State
 * Displayed while category content is loading
 */

export default function CategoryLoading() {
  return (
    <div className="category-page">
      <div className="category-container">
        {/* Category Header Skeleton */}
        <div className="category-header">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-8 bg-[var(--bg-tertiary)] rounded w-64 animate-pulse" />
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-96 animate-pulse" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="category-stats">
            {[1, 2, 3].map((i) => (
              <div key={i} className="stat-item">
                <div className="h-6 bg-[var(--bg-tertiary)] rounded w-12 mb-1 animate-pulse" />
                <div className="h-3 bg-[var(--bg-tertiary)] rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Actions Skeleton */}
          <div className="flex gap-3 mt-4">
            <div className="h-10 bg-[var(--bg-tertiary)] rounded w-32 animate-pulse" />
            <div className="h-10 bg-[var(--bg-tertiary)] rounded w-24 animate-pulse" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="category-filters">
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-[var(--bg-tertiary)] rounded w-28 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Threads List Skeleton */}
        <div className="thread-list">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="thread-item">
              <div className="thread-avatar">
                <div className="w-11 h-11 bg-[var(--bg-tertiary)] rounded-full animate-pulse" />
              </div>
              <div className="thread-content flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-5 bg-[var(--bg-tertiary)] rounded w-20 animate-pulse" />
                  <div className="h-5 bg-[var(--bg-tertiary)] rounded w-16 animate-pulse" />
                </div>
                <div className="h-6 bg-[var(--bg-tertiary)] rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2 animate-pulse" />
              </div>
              <div className="thread-stats space-y-2">
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-12 animate-pulse" />
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-12 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-10 h-10 bg-[var(--bg-tertiary)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
