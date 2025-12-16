import Link from 'next/link';
import { MessageSquare, Eye, Pin, Lock, Flame } from 'lucide-react';
import { Thread } from '@/lib/types';
import { cn, formatNumber, formatRelativeTime, getInitials, generateAvatarColor } from '@/lib/utils';
import { getCategoryBySlug } from '@/lib/categories';

interface ThreadCardProps {
  thread: Thread;
  variant?: 'default' | 'compact' | 'featured';
  showCategory?: boolean;
}

export default function ThreadCard({
  thread,
  variant = 'default',
  showCategory = false,
}: ThreadCardProps) {
  const category = getCategoryBySlug(thread.categoryId);

  const categoryColors: Record<string, string> = {
    trading: 'bg-trading/20 text-trading',
    deck: 'bg-deck/20 text-deck',
    tournament: 'bg-tournament/20 text-tournament',
    news: 'bg-news/20 text-news',
    collection: 'bg-collection/20 text-collection',
    price: 'bg-price/20 text-price',
    general: 'bg-general/20 text-general',
  };

  if (variant === 'compact') {
    return (
      <Link
        href={`/${thread.categoryId}/${thread.slug}`}
        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-dark-800 transition-colors group"
      >
        {/* Status Icons */}
        <div className="flex items-center gap-1 shrink-0">
          {thread.isPinned && <Pin className="h-3.5 w-3.5 text-pikachu-500" />}
          {thread.isHot && <Flame className="h-3.5 w-3.5 text-orange-500" />}
          {thread.isLocked && <Lock className="h-3.5 w-3.5 text-dark-500" />}
        </div>

        {/* Title */}
        <h4 className="flex-1 text-sm text-dark-200 group-hover:text-white truncate">
          {thread.title}
        </h4>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-dark-500 shrink-0">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {formatNumber(thread.postCount)}
          </span>
          <span>{formatRelativeTime(thread.updatedAt)}</span>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/${thread.categoryId}/${thread.slug}`}
        className="block p-5 rounded-xl bg-gradient-to-br from-dark-800 to-dark-850 border border-pikachu-500/30 hover:border-pikachu-500 transition-all group"
      >
        <div className="flex items-start gap-4">
          {/* Author Avatar */}
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
              thread.author.avatar ? '' : generateAvatarColor(thread.author.username)
            )}
          >
            {thread.author.avatar ? (
              <img
                src={thread.author.avatar}
                alt={thread.author.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white">{getInitials(thread.author.username)}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Category Badge */}
            {showCategory && category && (
              <span
                className={cn(
                  'inline-block text-xs px-2 py-0.5 rounded-full mb-2',
                  categoryColors[category.color] || 'bg-dark-700 text-dark-300'
                )}
              >
                {category.name}
              </span>
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold text-white group-hover:text-pikachu-400 transition-colors line-clamp-2 mb-2">
              {thread.isPinned && (
                <Pin className="inline h-4 w-4 text-pikachu-500 mr-2" />
              )}
              {thread.isHot && (
                <Flame className="inline h-4 w-4 text-orange-500 mr-2" />
              )}
              {thread.title}
            </h3>

            {/* Excerpt */}
            {thread.excerpt && (
              <p className="text-sm text-dark-400 line-clamp-2 mb-3">
                {thread.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-dark-500">
              <span>by <span className="text-dark-300">{thread.author.username}</span></span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {formatNumber(thread.postCount)} replies
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {formatNumber(thread.viewCount)} views
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/${thread.categoryId}/${thread.slug}`}
      className="flex items-center gap-4 p-4 bg-dark-800 rounded-lg border border-dark-700 hover:border-dark-600 transition-all group"
    >
      {/* Author Avatar */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
          thread.author.avatar ? '' : generateAvatarColor(thread.author.username)
        )}
      >
        {thread.author.avatar ? (
          <img
            src={thread.author.avatar}
            alt={thread.author.username}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-white">{getInitials(thread.author.username)}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Status Icons */}
          {thread.isPinned && (
            <Pin className="h-4 w-4 text-pikachu-500 shrink-0" />
          )}
          {thread.isHot && (
            <Flame className="h-4 w-4 text-orange-500 shrink-0" />
          )}
          {thread.isLocked && (
            <Lock className="h-4 w-4 text-dark-500 shrink-0" />
          )}

          {/* Category Badge */}
          {showCategory && category && (
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full shrink-0',
                categoryColors[category.color] || 'bg-dark-700 text-dark-300'
              )}
            >
              {category.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-medium text-white group-hover:text-pikachu-400 transition-colors line-clamp-1 mb-1">
          {thread.title}
        </h4>

        {/* Author & Time */}
        <div className="flex items-center gap-2 text-xs text-dark-500">
          <span>{thread.author.username}</span>
          <span>·</span>
          <span>{formatRelativeTime(thread.createdAt)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6 shrink-0 text-center">
        <div>
          <div className="text-sm font-medium text-white">
            {formatNumber(thread.postCount)}
          </div>
          <div className="text-xs text-dark-500">replies</div>
        </div>
        <div>
          <div className="text-sm font-medium text-white">
            {formatNumber(thread.viewCount)}
          </div>
          <div className="text-xs text-dark-500">views</div>
        </div>
      </div>

      {/* Last Reply */}
      {thread.lastReply && (
        <div className="hidden md:block text-right shrink-0 min-w-[140px]">
          <div className="text-xs text-dark-400 truncate">
            {thread.lastReply.username}
          </div>
          <div className="text-xs text-dark-500">
            {formatRelativeTime(thread.lastReply.timestamp)}
          </div>
        </div>
      )}
    </Link>
  );
}
