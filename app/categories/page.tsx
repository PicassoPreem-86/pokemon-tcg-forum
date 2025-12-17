'use client';

import Link from 'next/link';
import { Grid3X3, MessageSquare, Star, TrendingUp, Award, BookOpen, Newspaper, ArrowLeftRight } from 'lucide-react';
import { CATEGORIES, formatNumber } from '@/lib/categories';

const iconMap: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="w-8 h-8" />,
  Star: <Star className="w-8 h-8" />,
  TrendingUp: <TrendingUp className="w-8 h-8" />,
  Award: <Award className="w-8 h-8" />,
  BookOpen: <BookOpen className="w-8 h-8" />,
  Newspaper: <Newspaper className="w-8 h-8" />,
  ArrowLeftRight: <ArrowLeftRight className="w-8 h-8" />,
};

export default function CategoriesPage() {
  return (
    <div className="content-container">
      <div className="section-header">
        <h1 className="section-title">
          <Grid3X3 className="w-6 h-6" />
          All Categories
        </h1>
      </div>

      <div className="grid gap-4">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/c/${category.slug}`}
            className="category-card"
            style={{ display: 'flex', padding: '1.5rem' }}
          >
            <div
              className="category-icon-box"
              style={{ backgroundColor: category.color, width: '64px', height: '64px' }}
            >
              {iconMap[category.icon] || <MessageSquare className="w-8 h-8" />}
            </div>
            <div className="category-content" style={{ marginLeft: '1rem' }}>
              <h2 className="category-name" style={{ fontSize: '1.25rem' }}>{category.name}</h2>
              <p className="category-description" style={{ marginTop: '0.25rem' }}>{category.description}</p>
              <div className="category-stats" style={{ marginTop: '0.5rem' }}>
                <span>{formatNumber(category.threadCount)}</span> topics · <span>{formatNumber(category.postCount)}</span> posts
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
