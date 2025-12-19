'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Layers,
  Trophy,
  Megaphone,
  Star,
  TrendingUp,
  MessageCircle,
  Users,
  Flame,
  Clock,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { cn, formatNumber } from '@/lib/utils';
import { Category } from '@/lib/categories';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowLeftRight,
  Layers,
  Trophy,
  Megaphone,
  Star,
  TrendingUp,
  MessageCircle,
};

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export default function Sidebar({ isOpen = true, onToggle, className }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const CategoryIcon = ({ iconName }: { iconName: string }) => {
    const Icon = iconMap[iconName] || MessageCircle;
    return <Icon className="h-5 w-5" />;
  };

  const isActiveCategory = (slug: string) => {
    return pathname?.startsWith(`/${slug}`);
  };

  return (
    <aside
      className={cn(
        'bg-dark-900 border-r border-dark-700 transition-all duration-300',
        isOpen ? 'w-72' : 'w-16',
        className
      )}
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-dark-800">
        {isOpen && <h2 className="text-sm font-semibold text-dark-300">Forums</h2>}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Quick Stats (Collapsed View) */}
      {!isOpen && (
        <div className="p-2 space-y-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className={cn(
                'flex items-center justify-center p-2 rounded-lg transition-colors',
                isActiveCategory(category.slug)
                  ? 'bg-dark-700 text-purple-500'
                  : 'text-dark-400 hover:bg-dark-800 hover:text-white'
              )}
              title={category.name}
            >
              <CategoryIcon iconName={category.icon} />
            </Link>
          ))}
        </div>
      )}

      {/* Expanded View */}
      {isOpen && (
        <div className="p-4 space-y-2">
          {/* Quick Links */}
          <div className="mb-4">
            <Link
              href="/forums?filter=latest"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-white transition-colors"
            >
              <Clock className="h-4 w-4" />
              <span className="text-sm">Latest Posts</span>
            </Link>
            <Link
              href="/forums?filter=trending"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-white transition-colors"
            >
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Trending</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-dark-800 my-4" />

          {/* Categories */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider px-3 mb-2">
              Categories
            </h3>
            {CATEGORIES.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                isActive={isActiveCategory(category.slug)}
                isHovered={hoveredCategory === category.id}
                onHover={() => setHoveredCategory(category.id)}
                onLeave={() => setHoveredCategory(null)}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-dark-800 my-4" />

          {/* Online Users Widget */}
          <div className="bg-dark-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-white">Online Now</span>
            </div>
            <div className="text-2xl font-bold text-purple-500 mb-1">
              2,847
            </div>
            <p className="text-xs text-dark-400">
              423 members, 2,424 guests
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

interface CategoryItemProps {
  category: Category;
  isActive: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}

function CategoryItem({
  category,
  isActive,
  isHovered,
  onHover,
  onLeave,
}: CategoryItemProps) {
  const Icon = iconMap[category.icon] || MessageCircle;

  const getColorStyle = (color: string) => ({
    color: color,
    backgroundColor: `${color}15`
  });

  const colorStyle = getColorStyle(category.color);

  return (
    <Link
      href={`/c/${category.slug}`}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
        isActive
          ? 'bg-dark-700'
          : 'text-dark-300 hover:bg-dark-800'
      )}
      style={isActive ? colorStyle : undefined}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div
        className={cn(
          'p-1.5 rounded-md',
          'bg-dark-700'
        )}
        style={(isActive || isHovered) ? { backgroundColor: `${category.color}15` } : undefined}
      >
        <span style={(isActive || isHovered) ? { color: category.color } : undefined}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate block">
          {category.name}
        </span>
      </div>
      <span className="text-xs text-dark-500">
        {formatNumber(category.threadCount || 0)}
      </span>
    </Link>
  );
}
