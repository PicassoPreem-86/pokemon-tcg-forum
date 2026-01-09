import { Suspense } from 'react';
import { searchThreads, searchUsers, getAllCategories } from '@/lib/db/queries';
import SearchPageClient from '@/components/search/SearchPageClient';
import { Search } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function SearchFallback() {
  return (
    <div className="search-page">
      <div className="search-header">
        <h1 className="search-title">
          <Search size={28} />
          Search
        </h1>
        <div className="search-form">
          <div className="search-input-wrapper">
            <Search size={20} className="search-input-icon" />
            <input
              type="text"
              placeholder="Loading..."
              className="search-input"
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}

async function SearchContent({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || '';

  // Fetch initial data if there's a query
  const [threads, users, categories] = await Promise.all([
    query ? searchThreads(query, 50) : Promise.resolve([]),
    query ? searchUsers(query, 20) : Promise.resolve([]),
    getAllCategories(),
  ]);

  return (
    <ErrorBoundary>
      <SearchPageClient
        initialQuery={query}
        initialThreads={threads}
        initialUsers={users}
        categories={categories}
      />
    </ErrorBoundary>
  );
}

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
}
