'use client';

import dynamic from 'next/dynamic';
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Users,
  Shield,
  FileText,
  Menu,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { initializeDemoAccount } from '@/lib/auth-store';

// Dynamic imports for components not needed on initial render
const MobileMenu = dynamic(() => import('@/components/layout/MobileMenu'), {
  ssr: false,
});
const UserMenu = dynamic(() => import('@/components/user/UserMenu'), {
  ssr: false,
  loading: () => <div className="user-menu-skeleton" />,
});

interface ForumLayoutProps {
  children: React.ReactNode;
}

export default function ForumLayout({ children }: ForumLayoutProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    initializeDemoAccount();
  }, []);

  return (
    <div className="page-wrapper">
      <MobileMenu isOpen={isMobileMenuOpen} onClose={handleMenuClose} />

      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo">
            <Image
              src="/images/tcg-gossip-logo.png"
              alt="TCG Gossip"
              width={280}
              height={120}
              className="w-full h-auto object-contain"
              priority
            />
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" className="sidebar-nav-item">
            <Clock className="w-5 h-5" />
            Latest
          </Link>
          <Link href="/groups" className="sidebar-nav-item">
            <Users className="w-5 h-5" />
            Groups
          </Link>
          <Link href="/rules" className="sidebar-nav-item">
            <Shield className="w-5 h-5" />
            The Rules
          </Link>
          <Link href="/wiki" className="sidebar-nav-item">
            <FileText className="w-5 h-5" />
            Wiki
          </Link>
        </nav>

        <div className="sidebar-section-title">Categories</div>
        <ul className="sidebar-categories">
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link href={`/c/${category.slug}`} className="sidebar-category-item">
                <span
                  className="sidebar-category-dot"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <button
            className="btn btn-ghost lg:hidden"
            onClick={handleMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search topics, posts, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="header-actions">
            <UserMenu />
          </div>
        </header>

        {children}

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-copyright">
              &copy; {new Date().getFullYear()} TCG Gossip. Trading card names and images are trademarks of their respective owners.
            </div>
            <ul className="footer-links">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </footer>
      </main>
    </div>
  );
}
