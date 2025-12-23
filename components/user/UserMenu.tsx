'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Crown,
  Shield,
  Star,
  MessageSquare,
  Heart,
  Bookmark,
  Bell
} from 'lucide-react';
import { useAuth, useRealtimeNotifications } from '@/lib/hooks';
import type { RealtimeNotification } from '@/lib/hooks';
import { signOut } from '@/lib/actions/auth';
import { getTrainerRank } from '@/lib/trainer-ranks';
import { getUnreadCount } from '@/lib/actions';
import { showNotificationToast } from '@/lib/toast-store';

// Role badge configuration
const roleConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  admin: { color: '#EF4444', icon: <Crown size={12} />, label: 'Admin' },
  moderator: { color: '#8B5CF6', icon: <Shield size={12} />, label: 'Moderator' },
  vip: { color: '#F59E0B', icon: <Star size={12} />, label: 'VIP' },
  member: { color: '#6B7280', icon: null, label: 'Member' },
  newbie: { color: '#10B981', icon: null, label: 'New Trainer' }
};

export default function UserMenu() {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Fetch unread notification count on mount
  useEffect(() => {
    async function fetchUnreadCount() {
      if (!isAuthenticated || !user) return;

      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    }

    if (isHydrated && isAuthenticated && user) {
      fetchUnreadCount();
    }
  }, [isHydrated, isAuthenticated, user]);

  // Handle new notification from realtime subscription
  const handleNewNotification = React.useCallback((notification: RealtimeNotification) => {
    // Increment unread count
    setUnreadCount((prev) => prev + 1);

    // Show toast notification
    showNotificationToast(notification.message, notification.type);
  }, []);

  // Handle notification marked as read
  const handleNotificationUpdate = React.useCallback((notification: RealtimeNotification) => {
    if (notification.is_read) {
      // Decrement unread count when marked as read
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  // Subscribe to real-time notification updates
  useRealtimeNotifications(user?.id, {
    onInsert: handleNewNotification,
    onUpdate: handleNotificationUpdate,
    enabled: isHydrated && isAuthenticated && !!user,
  });

  const handleLogout = async () => {
    setIsOpen(false);
    const result = await signOut();
    // Force a full page reload to clear all client state
    if (result.success) {
      window.location.href = result.redirectTo || '/';
    } else {
      console.error('Logout failed:', result.error);
      window.location.href = '/';
    }
  };

  // Debug logging

  // Show skeleton during SSR/hydration to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="user-menu-auth">
        <div className="user-menu-skeleton" />
      </div>
    );
  }

  // Not authenticated - show login/register buttons
  if (!isAuthenticated || !user) {
    return (
      <div className="user-menu-auth">
        <Link href="/login" className="user-menu-login">
          Log In
        </Link>
        <Link href="/register" className="user-menu-register">
          Sign Up
        </Link>
      </div>
    );
  }

  const roleInfo = roleConfig[user.role] || roleConfig.member;
  const trainerRank = getTrainerRank(user.post_count || 0);

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className={`user-menu-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="user-menu-avatar">
          <Image
            src={user.avatar_url || '/images/avatars/default.png'}
            alt={user.display_name || user.username}
            width={36}
            height={36}
          />
          {user.role !== 'member' && user.role !== 'newbie' && (
            <span
              className="user-menu-role-dot"
              style={{ backgroundColor: roleInfo.color }}
            />
          )}
        </div>
        <span className="user-menu-name">{user.display_name || user.username}</span>
        <ChevronDown
          size={16}
          className={`user-menu-chevron ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          {/* User Info Header */}
          <div className="user-menu-header">
            <div className="user-menu-header-avatar">
              <Image
                src={user.avatar_url || '/images/avatars/default.png'}
                alt={user.display_name || user.username}
                width={48}
                height={48}
              />
            </div>
            <div className="user-menu-header-info">
              <span className="user-menu-header-name">
                {user.display_name || user.username}
              </span>
              <span className="user-menu-header-username">@{user.username}</span>
              <div className="user-menu-header-badges">
                {user.role !== 'member' && user.role !== 'newbie' && (
                  <span
                    className="user-menu-badge"
                    style={{ backgroundColor: `${roleInfo.color}20`, color: roleInfo.color }}
                  >
                    {roleInfo.icon}
                    {roleInfo.label}
                  </span>
                )}
                <span
                  className="user-menu-badge"
                  style={{ backgroundColor: `${trainerRank.color}20`, color: trainerRank.color }}
                >
                  {trainerRank.name}
                </span>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="user-menu-stats">
            <div className="user-menu-stat">
              <span className="stat-value">{user.post_count || 0}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="user-menu-stat">
              <span className="stat-value">{user.reputation || 0}</span>
              <span className="stat-label">Rep</span>
            </div>
          </div>

          {/* Menu Links */}
          <div className="user-menu-links">
            <Link
              href={`/u/${user.username}`}
              className="user-menu-link"
              onClick={() => setIsOpen(false)}
            >
              <User size={18} />
              <span>My Profile</span>
            </Link>
            <Link
              href="/my-threads"
              className="user-menu-link"
              onClick={() => setIsOpen(false)}
            >
              <MessageSquare size={18} />
              <span>My Threads</span>
            </Link>
            <Link
              href="/bookmarks"
              className="user-menu-link"
              onClick={() => setIsOpen(false)}
            >
              <Bookmark size={18} />
              <span>Bookmarks</span>
            </Link>
            <Link
              href="/likes"
              className="user-menu-link"
              onClick={() => setIsOpen(false)}
            >
              <Heart size={18} />
              <span>Liked Posts</span>
            </Link>
            <Link
              href="/notifications"
              className="user-menu-link"
              onClick={() => setIsOpen(false)}
            >
              <Bell size={18} />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="user-menu-notification-badge">{unreadCount}</span>
              )}
            </Link>
          </div>

          {/* Admin Link (only for admins/moderators) */}
          {(user.role === 'admin' || user.role === 'moderator') && (
            <div className="user-menu-admin">
              <Link
                href="/admin"
                className="user-menu-link admin-link"
                onClick={() => setIsOpen(false)}
              >
                <Shield size={18} />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}

          {/* Settings & Logout */}
          <div className="user-menu-footer">
            <Link
              href="/settings"
              className="user-menu-link"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            <button className="user-menu-link user-menu-logout" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
