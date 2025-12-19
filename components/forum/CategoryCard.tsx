import Link from 'next/link';
import {
  ArrowLeftRight,
  Layers,
  Trophy,
  Megaphone,
  Star,
  TrendingUp,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';
import { ForumCategory } from '@/lib/types';
import { cn, formatNumber, formatRelativeTime } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowLeftRight,
  Layers,
  Trophy,
  Megaphone,
  Star,
  TrendingUp,
  MessageCircle,
};

interface CategoryCardProps {
  category: ForumCategory;
  variant?: 'default' | 'compact' | 'featured';
  showStats?: boolean;
}

export default function CategoryCard({
  category,
  variant = 'default',
  showStats = true,
}: CategoryCardProps) {
  const Icon = iconMap[category.icon] || MessageCircle;

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    trading: {
      bg: 'bg-trading/10',
      text: 'text-trading',
      border: 'border-trading/30 hover:border-trading',
    },
    deck: {
      bg: 'bg-deck/10',
      text: 'text-deck',
      border: 'border-deck/30 hover:border-deck',
    },
    tournament: {
      bg: 'bg-tournament/10',
      text: 'text-tournament',
      border: 'border-tournament/30 hover:border-tournament',
    },
    news: {
      bg: 'bg-news/10',
      text: 'text-news',
      border: 'border-news/30 hover:border-news',
    },
    collection: {
      bg: 'bg-collection/10',
      text: 'text-collection',
      border: 'border-collection/30 hover:border-collection',
    },
    price: {
      bg: 'bg-price/10',
      text: 'text-price',
      border: 'border-price/30 hover:border-price',
    },
    general: {
      bg: 'bg-general/10',
      text: 'text-general',
      border: 'border-general/30 hover:border-general',
    },
  };

  const colors = colorClasses[category.color] || colorClasses.general;

  if (variant === 'compact') {
    return (
      <Link
        href={`/${category.slug}`}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg bg-dark-800 border transition-all',
          colors.border,
          'hover:bg-dark-750'
        )}
      >
        <div className={cn('p-2 rounded-lg', colors.bg)}>
          <Icon className={cn('h-5 w-5', colors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white truncate">
            {category.name}
          </h3>
        </div>
        <ChevronRight className="h-4 w-4 text-dark-500" />
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/${category.slug}`}
        className={cn(
          'relative overflow-hidden rounded-xl bg-dark-800 border transition-all group',
          colors.border
        )}
      >
        {/* Background Pattern */}
        <div
          className={cn(
            'absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity',
            colors.bg
          )}
        />

        <div className="relative p-6">
          {/* Icon */}
          <div
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
              colors.bg
            )}
          >
            <Icon className={cn('h-7 w-7', colors.text)} />
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-dark-400 line-clamp-2 mb-4">
            {category.description}
          </p>

          {/* Stats */}
          {showStats && (
            <div className="flex items-center gap-4 text-xs text-dark-500">
              <span>{formatNumber(category.threadCount || 0)} threads</span>
              <span>{formatNumber(category.postCount || 0)} posts</span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/${category.slug}`}
      className={cn(
        'block p-4 rounded-lg bg-dark-800 border transition-all group',
        colors.border,
        'hover:shadow-lg'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'p-3 rounded-xl shrink-0',
            colors.bg
          )}
        >
          <Icon className={cn('h-6 w-6', colors.text)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-white group-hover:text-purple-400 transition-colors">
              {category.name}
            </h3>
          </div>
          <p className="text-sm text-dark-400 line-clamp-2 mb-3">
            {category.description}
          </p>

          {/* Subcategories */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {category.subcategories.map((sub) => (
                <span
                  key={sub.id}
                  className="text-xs px-2 py-1 rounded-full bg-dark-700 text-dark-300"
                >
                  {sub.name}
                </span>
              ))}
            </div>
          )}

          {/* Stats & Last Activity */}
          {showStats && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-dark-500">
                <span>{formatNumber(category.threadCount || 0)} threads</span>
                <span>{formatNumber(category.postCount || 0)} posts</span>
              </div>
              {category.lastActivity && (
                <div className="text-xs text-dark-500">
                  <span className="text-dark-400">{category.lastActivity.username}</span>
                  {' · '}
                  {formatRelativeTime(category.lastActivity.timestamp)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-dark-600 group-hover:text-dark-400 transition-colors shrink-0 mt-1" />
      </div>
    </Link>
  );
}
