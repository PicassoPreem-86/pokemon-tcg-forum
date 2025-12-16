'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftRight,
  Plus,
  Filter,
  Clock,
  Flame,
  Pin,
  ChevronDown,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';
import Sidebar from '@/components/layout/Sidebar';
import ThreadCard from '@/components/forum/ThreadCard';
import { getCategoryBySlug } from '@/lib/categories';
import { getThreadsByCategory, getPinnedThreads } from '@/lib/mock-data/threads';
import { cn } from '@/lib/utils';

const category = getCategoryBySlug('buy-trade') || {
  id: 'trade',
  slug: 'buy-trade',
  name: 'Buy & Trade',
  description: 'Buy, sell, and trade Pokemon cards with the community',
  color: '#06B6D4',
  icon: 'ArrowLeftRight',
  threadCount: 5678,
  postCount: 123456,
};
const threads = getThreadsByCategory('buy-trade') || [];
const pinnedThreads = threads.filter(t => t.isPinned);
const regularThreads = threads.filter(t => !t.isPinned);

export default function TradingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest');

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Header
        isMenuOpen={isMobileMenuOpen}
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            className="sticky top-0 h-screen"
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Category Header */}
          <div className="bg-dark-800 border-b border-dark-700">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-trading/10">
                  <ArrowLeftRight className="h-8 w-8 text-trading" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {category.name}
                  </h1>
                  <p className="text-dark-400">
                    {category.description}
                  </p>
                </div>
                <Link
                  href="/trading/new"
                  className="btn-pikachu flex items-center gap-2 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  New Thread
                </Link>
              </div>
            </div>
          </div>

          {/* Filters & Sort */}
          <div className="border-b border-dark-800 bg-dark-900/50 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSortBy('latest')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                      sortBy === 'latest'
                        ? 'bg-pikachu-500/10 text-pikachu-500'
                        : 'text-dark-400 hover:text-white hover:bg-dark-800'
                    )}
                  >
                    <Clock className="h-4 w-4" />
                    Latest
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                      sortBy === 'popular'
                        ? 'bg-pikachu-500/10 text-pikachu-500'
                        : 'text-dark-400 hover:text-white hover:bg-dark-800'
                    )}
                  >
                    <Flame className="h-4 w-4" />
                    Popular
                  </button>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
                  <Filter className="h-4 w-4" />
                  Filter
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Thread List */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Pinned Threads */}
            {pinnedThreads.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-dark-500 mb-3">
                  <Pin className="h-4 w-4" />
                  Pinned
                </div>
                <div className="space-y-3">
                  {pinnedThreads.map((thread) => (
                    <ThreadCard key={thread.id} thread={thread} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Threads */}
            <div className="space-y-3">
              {regularThreads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <button className="px-4 py-2 text-sm text-dark-400 hover:text-white bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 text-sm bg-pikachu-500 text-dark-900 font-medium rounded-lg">
                1
              </button>
              <button className="px-4 py-2 text-sm text-dark-400 hover:text-white bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors">
                2
              </button>
              <button className="px-4 py-2 text-sm text-dark-400 hover:text-white bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors">
                3
              </button>
              <span className="px-2 text-dark-500">...</span>
              <button className="px-4 py-2 text-sm text-dark-400 hover:text-white bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors">
                12
              </button>
              <button className="px-4 py-2 text-sm text-dark-400 hover:text-white bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors">
                Next
              </button>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
