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
} from 'lucide-react';
import { useAuthStateAfterHydration, useAuthStore, isUserAdmin, initializeDemoAccount } from '@/lib/auth-store';

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
  const { logout } = useAuthStore();
  const { user, isAuthenticated, isHydrated } = useAuthStateAfterHydration();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    initializeDemoAccount();
  }, []);

  // Redirect non-admin users
  useEffect(() => {
    if (isHydrated && (!isAuthenticated || !isUserAdmin(user))) {
      router.push('/login?redirect=/admin&error=unauthorized');
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Show loading while checking auth
  if (!isHydrated || !isAuthenticated || !isUserAdmin(user)) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
        <p>Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          <Link href="/admin" className="admin-logo">
            <Shield className="w-8 h-8 text-yellow-500" />
            {!isCollapsed && <span>Admin Panel</span>}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="admin-collapse-btn"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
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
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-item" title={isCollapsed ? 'Back to Forum' : undefined}>
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
                src={user?.avatar || '/images/avatars/default.png'}
                alt={user?.displayName || 'Admin'}
                width={36}
                height={36}
                className="admin-user-avatar"
              />
              <div className="admin-user-details">
                <span className="admin-user-name">{user?.displayName}</span>
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
