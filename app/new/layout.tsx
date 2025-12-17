'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  MessageCircle,
  Users,
  Shield,
  FileText,
  Menu,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import MobileMenu from '@/components/layout/MobileMenu';
import UserMenu from '@/components/user/UserMenu';
import { initializeDemoAccount } from '@/lib/auth-store';

export default function NewThreadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    initializeDemoAccount();
  }, []);

  return (
    <div className="page-wrapper">
      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={handleMenuClose} />

      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo">
            <Image
              src="/images/pikachu-logo.png"
              alt=""
              width={40}
              height={40}
              className="sidebar-logo-img"
            />
            <span className="sidebar-logo-text">PIKACHU TCG</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" className="sidebar-nav-item">
            <Clock className="w-5 h-5" />
            Latest
          </Link>
          <Link href="https://discord.gg/pokemon" className="sidebar-nav-item" target="_blank">
            <MessageCircle className="w-5 h-5" />
            Discord Server
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

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <button
            className="btn btn-ghost lg:hidden"
            onClick={handleMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="header-search">
            <input type="text" placeholder="Search topics, posts, users..." />
          </div>

          <div className="header-actions">
            <UserMenu />
          </div>
        </header>

        {/* Content */}
        {children}

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-copyright">
              &copy; 2024 Pikachu TCG Forum. Pokemon and all related names are trademarks of Nintendo/Creatures Inc./GAME FREAK inc.
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
