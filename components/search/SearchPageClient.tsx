'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  MessageSquare,
  Eye,
  User,
  Flame,
  Pin,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import type { Thread, User as DBUser } from '@/lib/db/queries';

type SearchType = 'all' | 'threads' | 'users';
type SortBy = 'relevance' | 'newest' | 'oldest' | 'most_replies' | 'most_views';

interface SearchPageClientProps {
  initialQuery: string;
  initialThreads: Thread[];
  initialUsers: DBUser[];
  categories: any[];
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays < 1) return 'Today';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export default function SearchPageClient({
  initialQuery,
  initialThreads,
  initialUsers,
  categories
}: SearchPageClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort results
  const searchResults = useMemo(() => {
    const threads = initialThreads.filter(thread =>
      selectedCategory === 'all' || thread.category.id === selectedCategory
    );

    // Sort threads
    const sortedThreads = [...threads].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_replies':
          return b.post_count - a.post_count;
        case 'most_views':
          return b.view_count - a.view_count;
        default:
          return 0;
      }
    });

    return { threads: sortedThreads, users: initialUsers };
  }, [initialThreads, initialUsers, sortBy, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="search-page">
      {/* Search Header */}
      <div className="search-header">
        <h1 className="search-title">
          <Search size={28} />
          Search
        </h1>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <Search size={20} className="search-input-icon" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search threads, users, tags..."
              className="search-input"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="search-clear"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {/* Search Type Tabs */}
        <div className="search-tabs">
          <button
            className={`search-tab ${searchType === 'all' ? 'active' : ''}`}
            onClick={() => setSearchType('all')}
          >
            All Results
          </button>
          <button
            className={`search-tab ${searchType === 'threads' ? 'active' : ''}`}
            onClick={() => setSearchType('threads')}
          >
            <MessageSquare size={16} />
            Threads ({searchResults.threads.length})
          </button>
          <button
            className={`search-tab ${searchType === 'users' ? 'active' : ''}`}
            onClick={() => setSearchType('users')}
          >
            <User size={16} />
            Users ({searchResults.users.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="search-filters">
        <button
          className="search-filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={16} />
          Filters
          <ChevronDown size={16} className={showFilters ? 'rotate' : ''} />
        </button>

        {showFilters && (
          <div className="search-filter-panel">
            <div className="search-filter-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="search-select"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="search-filter-group">
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="search-select"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_replies">Most Replies</option>
                <option value="most_views">Most Views</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="search-results">
        {!initialQuery ? (
          <div className="search-empty">
            <Search size={64} />
            <h2>Start Searching</h2>
            <p>Enter a search term to find threads, users, and more.</p>
            <div className="search-suggestions">
              <span>Popular searches:</span>
              <button onClick={() => router.push('/search?q=Charizard')}>Charizard</button>
              <button onClick={() => router.push('/search?q=PSA%2010')}>PSA 10</button>
              <button onClick={() => router.push('/search?q=deck%20building')}>deck building</button>
              <button onClick={() => router.push('/search?q=Prismatic%20Evolutions')}>Prismatic Evolutions</button>
            </div>
          </div>
        ) : searchResults.threads.length === 0 && searchResults.users.length === 0 ? (
          <div className="search-empty">
            <Search size={64} />
            <h2>No Results Found</h2>
            <p>No matches found for &quot;{initialQuery}&quot;. Try different keywords.</p>
          </div>
        ) : (
          <>
            {/* Thread Results */}
            {(searchType === 'all' || searchType === 'threads') && searchResults.threads.length > 0 && (
              <div className="search-section">
                {searchType === 'all' && (
                  <h2 className="search-section-title">
                    <MessageSquare size={20} />
                    Threads ({searchResults.threads.length})
                  </h2>
                )}
                <div className="search-thread-list">
                  {searchResults.threads.map(thread => (
                    <Link
                      key={thread.id}
                      href={`/thread/${thread.slug}`}
                      className="search-thread-item"
                    >
                      <div className="search-thread-avatar">
                        <Image
                          src={thread.author.avatar_url || '/images/avatars/default.png'}
                          alt={thread.author.username}
                          width={44}
                          height={44}
                        />
                      </div>
                      <div className="search-thread-content">
                        <div className="search-thread-title-row">
                          {thread.is_pinned && (
                            <span className="badge badge-pinned"><Pin size={12} /></span>
                          )}
                          {thread.is_hot && (
                            <span className="badge badge-hot"><Flame size={12} /></span>
                          )}
                          <h3 className="search-thread-title">{thread.title}</h3>
                        </div>
                        <p className="search-thread-excerpt">{thread.excerpt || thread.content.slice(0, 150) + '...'}</p>
                        <div className="search-thread-meta">
                          <span className="search-thread-category" style={{ color: thread.category.color }}>
                            {thread.category.name}
                          </span>
                          <span>by {thread.author.display_name || thread.author.username}</span>
                          <span>{formatTimeAgo(thread.updated_at)}</span>
                          {thread.tags && thread.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="search-thread-tag">#{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="search-thread-stats">
                        <div className="search-stat">
                          <MessageSquare size={14} />
                          {formatNumber(thread.post_count)}
                        </div>
                        <div className="search-stat">
                          <Eye size={14} />
                          {formatNumber(thread.view_count)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* User Results */}
            {(searchType === 'all' || searchType === 'users') && searchResults.users.length > 0 && (
              <div className="search-section">
                {searchType === 'all' && (
                  <h2 className="search-section-title">
                    <User size={20} />
                    Users ({searchResults.users.length})
                  </h2>
                )}
                <div className="search-user-list">
                  {searchResults.users.map(user => (
                    <Link
                      key={user.id}
                      href={`/u/${user.username}`}
                      className="search-user-item"
                    >
                      <div className="search-user-avatar">
                        <Image
                          src={user.avatar_url || '/images/avatars/default.png'}
                          alt={user.display_name || user.username}
                          width={56}
                          height={56}
                        />
                      </div>
                      <div className="search-user-info">
                        <h3 className="search-user-name">{user.display_name || user.username}</h3>
                        <p className="search-user-username">@{user.username}</p>
                        {user.bio && (
                          <p className="search-user-bio">{user.bio.slice(0, 100)}...</p>
                        )}
                      </div>
                      <div className="search-user-stats">
                        <div className="search-user-stat">
                          <span className="stat-value">{formatNumber(user.post_count)}</span>
                          <span className="stat-label">Posts</span>
                        </div>
                        <div className="search-user-stat">
                          <span className="stat-value">{formatNumber(user.reputation)}</span>
                          <span className="stat-label">Rep</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
