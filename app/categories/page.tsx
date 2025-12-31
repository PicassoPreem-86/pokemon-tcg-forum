import Link from 'next/link';
import { Grid3X3, MessageSquare, Star, TrendingUp, Award, BookOpen, Newspaper, ArrowLeftRight } from 'lucide-react';
import { getAllCategories } from '@/lib/db/queries';
import { formatNumber } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="w-8 h-8" />,
  Star: <Star className="w-8 h-8" />,
  TrendingUp: <TrendingUp className="w-8 h-8" />,
  Award: <Award className="w-8 h-8" />,
  BookOpen: <BookOpen className="w-8 h-8" />,
  Newspaper: <Newspaper className="w-8 h-8" />,
  ArrowLeftRight: <ArrowLeftRight className="w-8 h-8" />,
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="content-container">
      <div className="section-header">
        <h1 className="section-title">
          <Grid3X3 className="w-6 h-6" />
          All Categories
        </h1>
        <p className="text-slate-400">
          Browse all discussion categories
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid gap-4">
          {categories.map((category) => {
            // Get thread count and post count (will be 0 for now, can be enhanced later)
            const threadCount = 0;
            const postCount = 0;

            return (
              <Link
                key={(category as any).id}
                href={`/c/${(category as any).slug}`}
                className="category-card"
                style={{ display: 'flex', padding: '1.5rem' }}
              >
                <div
                  className="category-icon-box"
                  style={{ backgroundColor: (category as any).color, width: '64px', height: '64px' }}
                >
                  {iconMap[(category as any).icon] || <MessageSquare className="w-8 h-8" />}
                </div>
                <div className="category-content" style={{ marginLeft: '1rem' }}>
                  <h2 className="category-name" style={{ fontSize: '1.25rem' }}>{(category as any).name}</h2>
                  <p className="category-description" style={{ marginTop: '0.25rem' }}>{(category as any).description}</p>
                  <div className="category-stats" style={{ marginTop: '0.5rem' }}>
                    <span>{formatNumber(threadCount)}</span> topics · <span>{formatNumber(postCount)}</span> posts
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
          <Grid3X3 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No categories yet</h3>
          <p className="text-slate-400">
            Categories will appear here once they are created.
          </p>
        </div>
      )}
    </div>
  );
}
