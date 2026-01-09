/**
 * Global Loading State
 * Displayed while the homepage is loading
 */

export default function Loading() {
  return (
    <div className="page-wrapper">
      {/* Sidebar Skeleton */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="h-16 bg-[var(--bg-tertiary)] rounded animate-pulse" />
        </div>

        {/* New Thread Button Skeleton */}
        <div className="mx-4 mb-4 h-12 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />

        {/* Nav Items Skeleton */}
        <nav className="sidebar-nav">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-[var(--bg-tertiary)] rounded mb-2 animate-pulse" />
          ))}
        </nav>

        {/* Categories Skeleton */}
        <div className="sidebar-section-title">Categories</div>
        <ul className="sidebar-categories">
          {[1, 2, 3, 4, 5].map((i) => (
            <li key={i} className="h-8 bg-[var(--bg-tertiary)] rounded mb-2 animate-pulse" />
          ))}
        </ul>
      </aside>

      {/* Main Content Skeleton */}
      <main className="main-content">
        <div className="content-container">
          {/* Hero Banner Skeleton */}
          <div className="hero-banner-full">
            <div className="w-full h-64 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
          </div>

          {/* Welcome Box Skeleton */}
          <div className="welcome-box">
            <div className="h-6 bg-[var(--bg-tertiary)] rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-10 bg-[var(--bg-tertiary)] rounded w-32 animate-pulse" />
          </div>

          {/* Stats Skeleton */}
          <div className="stats-widget">
            <div className="stats-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="stat-item">
                  <div className="h-8 bg-[var(--bg-tertiary)] rounded w-16 mb-2 animate-pulse" />
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-20 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="tabs">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-[var(--bg-tertiary)] rounded w-32 animate-pulse" />
            ))}
          </div>

          {/* Categories Grid Skeleton */}
          <div className="categories-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="category-card">
                <div className="w-14 h-14 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-[var(--bg-tertiary)] rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full animate-pulse" />
                  <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Threads Skeleton */}
          <div className="section-header">
            <div className="h-7 bg-[var(--bg-tertiary)] rounded w-48 animate-pulse" />
            <div className="h-10 bg-[var(--bg-tertiary)] rounded w-32 animate-pulse" />
          </div>

          <div className="thread-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="thread-item">
                <div className="thread-avatar">
                  <div className="w-11 h-11 bg-[var(--bg-tertiary)] rounded-full animate-pulse" />
                </div>
                <div className="thread-content flex-1 space-y-2">
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/4 animate-pulse" />
                  <div className="h-6 bg-[var(--bg-tertiary)] rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/2 animate-pulse" />
                </div>
                <div className="thread-stats space-y-2">
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-12 animate-pulse" />
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-12 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
