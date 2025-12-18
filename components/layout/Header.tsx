'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Menu,
  X,
  Bell,
  User,
  LogIn,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { NAV_ITEMS, SITE_CONFIG } from '@/lib/config';
import { cn } from '@/lib/utils';
import UserMenu from '@/components/user/UserMenu';
import { useAuthStateAfterHydration, initializeDemoAccount } from '@/lib/auth-store';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export default function Header({ onMenuToggle, isMenuOpen }: HeaderProps) {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isHydrated } = useAuthStateAfterHydration();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Initialize demo account on mount
  useEffect(() => {
    initializeDemoAccount();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-pikachu-600 via-pikachu-500 to-pikachu-600 text-dark-900 py-2 px-4 text-center text-sm font-medium">
        <span className="flex items-center justify-center gap-2">
          <Zap className="h-4 w-4" />
          New Scarlet & Violet: Surging Sparks set discussion now live!
          <Link href="/news" className="underline hover:no-underline ml-1">
            Join the discussion →
          </Link>
        </span>
      </div>

      {/* Main Header */}
      <div className="bg-dark-900/95 backdrop-blur-md border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Menu Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-dark-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-dark-300" />
                ) : (
                  <Menu className="h-6 w-6 text-dark-300" />
                )}
              </button>

              <Link href="/" className="flex items-center gap-3 group">
                {/* Pikachu-style Logo */}
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-pikachu-400 to-pikachu-600 flex items-center justify-center shadow-lg group-hover:shadow-pikachu-500/30 transition-shadow">
                  <Zap className="h-6 w-6 text-dark-900" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-dark-900" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-white leading-none">
                    {SITE_CONFIG.name.split(' ')[0]}{' '}
                    <span className="text-pikachu-500">TCG</span>
                  </h1>
                  <p className="text-xs text-dark-400">Forum</p>
                </div>
              </Link>
            </div>

            {/* Center: Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    'text-dark-300 hover:text-white hover:bg-dark-800'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right: Search, Notifications, User */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
                    <input
                      type="text"
                      placeholder="Search forums..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-white placeholder-dark-400 focus:outline-none focus:border-pikachu-500 focus:ring-1 focus:ring-pikachu-500"
                      autoFocus
                    />
                    <Search className="absolute left-3 h-4 w-4 text-dark-400" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="absolute right-2 p-1 hover:bg-dark-700 rounded"
                    >
                      <X className="h-4 w-4 text-dark-400" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5 text-dark-300" />
                  </button>
                )}
              </div>

              {/* Notifications - Only show when authenticated (after hydration) */}
              {isHydrated && isAuthenticated && (
                <button
                  className="relative p-2 rounded-lg hover:bg-dark-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-dark-300" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-pikachu-500 rounded-full" />
                </button>
              )}

              {/* User Menu / Login */}
              <div className="ml-2">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Navigation (Desktop) */}
        <div className="hidden lg:block border-t border-dark-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 h-10 text-sm">
              <Link
                href="/forums"
                className="text-dark-400 hover:text-pikachu-500 transition-colors"
              >
                What&apos;s New
              </Link>
              <Link
                href="/forums?filter=latest"
                className="text-dark-400 hover:text-pikachu-500 transition-colors"
              >
                New Posts
              </Link>
              <Link
                href="/forums?filter=trending"
                className="text-dark-400 hover:text-pikachu-500 transition-colors"
              >
                Trending
              </Link>
              <Link
                href="/members"
                className="text-dark-400 hover:text-pikachu-500 transition-colors"
              >
                Members
              </Link>
              <div className="flex-1" />
              <span className="text-dark-500">
                <span className="text-pikachu-500 font-medium">2,847</span> trainers online
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
