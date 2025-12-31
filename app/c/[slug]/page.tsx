import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getThreadsByCategory, getCategoryBySlug } from '@/lib/db/queries';
import { MessageSquare, Star, TrendingUp, Award, BookOpen, Newspaper, ArrowLeftRight, PenSquare, Flame, Pin, Eye, Clock } from 'lucide-react';
import { formatNumber, formatRelativeTime } from '@/lib/utils';

const iconMap = {
  MessageSquare,
  Star,
  TrendingUp,
  Award,
  BookOpen,
  Newspaper,
  ArrowLeftRight,
};

function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toString();
}

type SortType = 'latest' | 'hot' | 'top';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { sort = 'latest' } = await searchParams;

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const threads = await getThreadsByCategory(slug, 50);
  const sortBy = (sort as SortType) || 'latest';
  const Icon = iconMap[(category as any).icon as keyof typeof iconMap] || MessageSquare;

  // Calculate stats from threads
  const threadCount = threads.length;
  const postCount = threads.reduce((sum, t) => sum + (t.post_count || 0), 0);

  return (
    <div className="content-container">
      {/* Category Header */}
      <div className="category-header">
        <div className="category-header-icon" style={{ backgroundColor: (category as any).color }}>
          <Icon />
        </div>
        <div className="category-header-content">
          <h1 className="category-header-title">{(category as any).name}</h1>
          <p className="category-header-description">{(category as any).description}</p>
        </div>
        <div className="category-header-stats">
          <div className="category-stat">
            <div className="category-stat-value">{formatCount(threadCount)}</div>
            <div className="category-stat-label">Topics</div>
          </div>
          <div className="category-stat">
            <div className="category-stat-value">{formatCount(postCount)}</div>
            <div className="category-stat-label">Posts</div>
          </div>
        </div>
      </div>

      {/* Sort Tabs and New Thread Button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="sort-tabs mb-0">
          <Link
            href={`/c/${slug}?sort=latest`}
            className={`sort-tab ${sortBy === 'latest' ? 'active' : ''}`}
          >
            Latest
          </Link>
          <Link
            href={`/c/${slug}?sort=hot`}
            className={`sort-tab ${sortBy === 'hot' ? 'active' : ''}`}
          >
            Hot
          </Link>
          <Link
            href={`/c/${slug}?sort=top`}
            className={`sort-tab ${sortBy === 'top' ? 'active' : ''}`}
          >
            Top
          </Link>
        </div>
        <Link
          href={`/new?category=${(category as any).id}`}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap"
          style={{
            background: 'linear-gradient(to right, #7c3aed, #9333ea)',
            color: '#ffffff',
          }}
        >
          <PenSquare className="h-4 w-4" style={{ color: '#ffffff' }} />
          <span style={{ color: '#ffffff' }}>New Thread</span>
        </Link>
      </div>

      {/* Thread List */}
      <div className="thread-list">
        {threads.length > 0 ? (
          threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/thread/${thread.slug}`}
              className="thread-item"
            >
              <div className="thread-avatar">
                <img
                  src={thread.author.avatar_url || '/images/avatars/default.png'}
                  alt={thread.author.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/avatars/default.png';
                  }}
                />
              </div>
              <div className="thread-content">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {thread.is_pinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </span>
                  )}
                  {thread.is_hot && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                      <Flame className="h-3 w-3" />
                      Hot
                    </span>
                  )}
                  <h3 className="thread-title">{thread.title}</h3>
                </div>
                {thread.excerpt && (
                  <p className="thread-excerpt">{thread.excerpt}</p>
                )}
                <div className="thread-meta">
                  <span>by {thread.author.display_name || thread.author.username}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(thread.updated_at)}
                  </span>
                </div>
              </div>
              <div className="thread-stats">
                <div className="thread-stat">
                  <MessageSquare className="h-4 w-4" />
                  <span>{formatNumber(thread.post_count)}</span>
                </div>
                <div className="thread-stat">
                  <Eye className="h-4 w-4" />
                  <span>{formatNumber(thread.view_count)}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <MessageSquare className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No threads yet</h3>
            <p className="text-slate-400 mb-4">
              Be the first to start a discussion in this category!
            </p>
            <Link
              href={`/new?category=${(category as any).id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
            >
              <PenSquare className="h-4 w-4" />
              Create Thread
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
