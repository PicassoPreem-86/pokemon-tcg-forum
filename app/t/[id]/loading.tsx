/**
 * Thread Detail Page Loading State
 * Displayed while thread content is loading
 */

export default function ThreadLoading() {
  return (
    <div className="thread-page">
      <div className="thread-container">
        {/* Thread Header Skeleton */}
        <div className="thread-header">
          <div className="thread-breadcrumb">
            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-32 animate-pulse" />
          </div>

          {/* Title Skeleton */}
          <div className="space-y-3 mt-4">
            <div className="flex gap-2">
              <div className="h-6 bg-[var(--bg-tertiary)] rounded w-24 animate-pulse" />
              <div className="h-6 bg-[var(--bg-tertiary)] rounded w-16 animate-pulse" />
            </div>
            <div className="h-8 bg-[var(--bg-tertiary)] rounded w-3/4 animate-pulse" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 bg-[var(--bg-tertiary)] rounded w-20 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Meta Skeleton */}
          <div className="thread-meta mt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-32 animate-pulse" />
                <div className="h-3 bg-[var(--bg-tertiary)] rounded w-48 animate-pulse" />
              </div>
            </div>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-[var(--bg-tertiary)] rounded w-20 animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Original Post Skeleton */}
        <div className="thread-posts">
          <div className="post-card">
            <div className="post-author">
              <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-full animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-32 animate-pulse" />
                <div className="h-3 bg-[var(--bg-tertiary)] rounded w-24 animate-pulse" />
              </div>
            </div>
            <div className="post-content space-y-3">
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full animate-pulse" />
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full animate-pulse" />
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full animate-pulse" />
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-2/3 animate-pulse" />
            </div>
            <div className="post-actions">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-[var(--bg-tertiary)] rounded w-20 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Reply Skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="post-card">
              <div className="post-author">
                <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-28 animate-pulse" />
                  <div className="h-3 bg-[var(--bg-tertiary)] rounded w-20 animate-pulse" />
                </div>
              </div>
              <div className="post-content space-y-2">
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full animate-pulse" />
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4 animate-pulse" />
              </div>
              <div className="post-actions">
                {[1, 2].map((j) => (
                  <div key={j} className="h-8 bg-[var(--bg-tertiary)] rounded w-16 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form Skeleton */}
        <div className="reply-form">
          <div className="h-6 bg-[var(--bg-tertiary)] rounded w-32 mb-4 animate-pulse" />
          <div className="h-32 bg-[var(--bg-tertiary)] rounded mb-4 animate-pulse" />
          <div className="h-10 bg-[var(--bg-tertiary)] rounded w-32 animate-pulse" />
        </div>
      </div>

      {/* Sidebar Skeleton */}
      <aside className="thread-sidebar">
        <div className="sidebar-card">
          <div className="h-6 bg-[var(--bg-tertiary)] rounded w-32 mb-4 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
