'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { signOut } from '@/lib/actions/auth';

const adminNavItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Content', href: '/admin/content', icon: MessageSquare },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Reports', href: '/admin/reports', icon: Flag },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();
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

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  // Redirect non-admin users
  useEffect(() => {
    if (isHydrated && (!isAuthenticated || !isAdmin)) {
      router.push('/login?redirect=/admin&error=unauthorized');
    }
  }, [isHydrated, isAuthenticated, isAdmin, router]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Show loading while checking auth
  if (!isHydrated || !isAuthenticated || !isAdmin) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
        <p>Verifying admin access...</p>
      </div>
    );
  }

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
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.name : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
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
                src={user?.avatar_url || '/images/avatars/default.png'}
                alt={user?.display_name || user?.username || 'Admin'}
                width={36}
                height={36}
                className="admin-user-avatar"
              />
              <div className="admin-user-details">
                <span className="admin-user-name">{user?.display_name || user?.username}</span>
                <span className="admin-user-role">Administrator</span>
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
