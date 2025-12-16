'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  X,
  Home,
  LogIn,
  LogOut,
  User,
  Search,
  Clock,
  Flame,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { useAuthStore, useAuthStateAfterHydration } from '@/lib/auth-store';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const { user, isAuthenticated, isHydrated } = useAuthStateAfterHydration();

  // Close menu on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="mobile-menu-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <aside className="mobile-menu-panel">
        {/* Header */}
        <div className="mobile-menu-header">
          <h2 className="mobile-menu-title">Menu</h2>
          <button
            onClick={onClose}
            className="mobile-menu-close-btn"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="mobile-menu-content">
          {/* Search */}
          <Link href="/search" className="mobile-menu-search">
            <Search className="w-5 h-5" />
            <span>Search topics, posts, users...</span>
          </Link>

          {/* Quick Links */}
          <div className="mobile-menu-section">
            <div className="mobile-menu-section-title">Quick Links</div>
            <nav className="mobile-menu-nav">
              <Link href="/" className="mobile-menu-item">
                <Home className="w-5 h-5" />
                Home
              </Link>
              <Link href="/" className="mobile-menu-item">
                <Clock className="w-5 h-5" />
                Latest
              </Link>
              <Link href="/hot" className="mobile-menu-item">
                <Flame className="w-5 h-5" />
                Trending
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div className="mobile-menu-section">
            <div className="mobile-menu-section-title">Categories</div>
            <nav className="mobile-menu-nav">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={`/c/${category.slug}`}
                  className="mobile-menu-item"
                >
                  <span
                    className="mobile-menu-category-dot"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="flex-1">{category.name}</span>
                  <span className="mobile-menu-count">
                    {category.threadCount > 1000
                      ? `${Math.floor(category.threadCount / 1000)}k`
                      : category.threadCount}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Auth Section */}
          <div className="mobile-menu-section">
            {isHydrated && isAuthenticated && user ? (
              <div className="mobile-menu-user">
                <Link
                  href={`/u/${user.username}`}
                  className="mobile-menu-user-info"
                  onClick={onClose}
                >
                  <Image
                    src={user.avatar || '/images/avatars/default.png'}
                    alt={user.displayName || user.username}
                    width={40}
                    height={40}
                    className="mobile-menu-user-avatar"
                  />
                  <div className="mobile-menu-user-details">
                    <span className="mobile-menu-user-name">{user.displayName || user.username}</span>
                    <span className="mobile-menu-user-username">@{user.username}</span>
                  </div>
                </Link>
                <button onClick={handleLogout} className="mobile-menu-auth-btn secondary">
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="mobile-menu-auth-buttons">
                <Link href="/login" className="mobile-menu-auth-btn secondary" onClick={onClose}>
                  <LogIn className="w-5 h-5" />
                  Log In
                </Link>
                <Link href="/register" className="mobile-menu-auth-btn primary" onClick={onClose}>
                  <User className="w-5 h-5" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
