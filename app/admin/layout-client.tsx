'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FolderTree,
  Flag,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  ChevronLeft,
  Bell,
  Menu,
  X,
  FileText,
} from 'lucide-react';
import { signOut } from '@/lib/actions/auth';
import type { Profile } from '@/lib/supabase/database.types';

// Icon mapping for nav items (icons can't be passed from server components)
const NAV_ICONS: Record<string, React.ElementType> = {
  'Dashboard': LayoutDashboard,
  'Users': Users,
  'Content': MessageSquare,
  'Categories': FolderTree,
  'Reports': Flag,
  'Audit Log': FileText,
  'Analytics': BarChart3,
  'Settings': Settings,
};

interface AdminLayoutClientProps {
  adminProfile: Profile;
  adminNavItems: Array<{
    name: string;
    href: string;
  }>;
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  adminProfile,
  adminNavItems,
  children,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      window.location.href = result.redirectTo || '/';
    } else {
      console.error('Logout failed:', result.error);
      window.location.href = '/';
    }
  };

  return (
    <div className="admin-wrapper">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link href="/admin" className="admin-logo">
            <Shield className="w-8 h-8 text-yellow-500" />
            {!isCollapsed && <span>Admin Panel</span>}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="admin-collapse-btn desktop-only"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="admin-close-btn mobile-only"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="admin-nav">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            const NavIcon = NAV_ICONS[item.name] || LayoutDashboard;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.name : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <NavIcon className="w-5 h-5" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link
            href="/"
            className="admin-nav-item"
            title={isCollapsed ? 'Back to Forum' : undefined}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ChevronLeft className="w-5 h-5" />
            {!isCollapsed && <span>Back to Forum</span>}
          </Link>
          <button onClick={handleLogout} className="admin-nav-item logout" title={isCollapsed ? 'Log Out' : undefined}>
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="admin-mobile-menu-btn mobile-only"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="admin-page-title">
              {adminNavItems.find(item =>
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))
              )?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="admin-header-right">
            <button className="admin-header-btn">
              <Bell className="w-5 h-5" />
              <span className="admin-notification-badge">3</span>
            </button>
            <div className="admin-user-info">
              <Image
                src={adminProfile.avatar_url || '/images/avatars/default.png'}
                alt={adminProfile.display_name || adminProfile.username}
                width={36}
                height={36}
                className="admin-user-avatar"
              />
              <div className="admin-user-details">
                <span className="admin-user-name">{adminProfile.display_name || adminProfile.username}</span>
                <span className="admin-user-role">
                  {adminProfile.role === 'admin' ? 'Administrator' : 'Moderator'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
