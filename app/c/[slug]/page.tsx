import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug } from '@/lib/categories';
import { getThreadsByCategory } from '@/lib/mock-data/threads';
import { MessageSquare, Star, TrendingUp, Award, BookOpen, Newspaper, ArrowLeftRight } from 'lucide-react';
import CategoryThreadList from '@/components/forum/CategoryThreadList';

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
  const { sort = 'latest', page = '1' } = await searchParams;

  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const mockThreads = getThreadsByCategory(category.id);
  const sortBy = (sort as SortType) || 'latest';
  const currentPage = parseInt(page);
  const Icon = iconMap[category.icon as keyof typeof iconMap] || MessageSquare;

  return (
    <div className="content-container">
      {/* Category Header */}
      <div className="category-header">
        <div className="category-header-icon" style={{ backgroundColor: category.color }}>
          <Icon />
        </div>
        <div className="category-header-content">
          <h1 className="category-header-title">{category.name}</h1>
          <p className="category-header-description">{category.description}</p>
        </div>
        <div className="category-header-stats">
          <div className="category-stat">
            <div className="category-stat-value">{formatCount(category.threadCount)}</div>
            <div className="category-stat-label">Topics</div>
          </div>
          <div className="category-stat">
            <div className="category-stat-value">{formatCount(category.postCount)}</div>
            <div className="category-stat-label">Posts</div>
          </div>
        </div>
      </div>

      {/* Sort Tabs */}
      <div className="sort-tabs">
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

      {/* Thread List - Client Component for combining user + mock threads */}
      <div className="thread-list">
        <CategoryThreadList
          categoryId={category.id}
          mockThreads={mockThreads}
          sortBy={sortBy}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
