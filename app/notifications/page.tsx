'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Loader2,
  ArrowLeft,
  MessageSquare,
  Heart,
  AtSign,
  Reply,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification,
} from '@/lib/actions';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'reply':
      return <Reply size={18} className="text-blue-400" />;
    case 'mention':
      return <AtSign size={18} className="text-purple-400" />;
    case 'like':
      return <Heart size={18} className="text-red-400" />;
    case 'follow':
      return <MessageSquare size={18} className="text-green-400" />;
    default:
      return <Bell size={18} className="text-gray-400" />;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;

      try {
        const data = await getUserNotifications(50);
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isHydrated && user) {
      fetchNotifications();
    }
  }, [isHydrated, user]);

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Show loading while checking auth
  if (!isHydrated) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <Loader2 size={48} className="spin" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <Link href={`/u/${user.username}`} className="settings-back">
            <ArrowLeft size={20} />
            Back to Profile
          </Link>
          <h1>
            <Bell className="inline-block mr-2" size={28} />
            Notifications
            {unreadCount > 0 && (
              <span className="notification-badge-header">{unreadCount}</span>
            )}
          </h1>
          <p>Stay updated on activity in your threads</p>
        </div>

        {/* Filters & Actions */}
        <div className="notifications-toolbar">
          <div className="notifications-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn btn-ghost btn-sm">
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="settings-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={64} className="empty-state-icon" />
            <h3>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</h3>
            <p>
              {filter === 'unread'
                ? "You're all caught up!"
                : "When someone replies to your threads or mentions you, you'll see it here."}
            </p>
            {filter === 'unread' && notifications.length > 0 && (
              <button onClick={() => setFilter('all')} className="btn btn-secondary mt-4">
                View all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <Link
                    href={notification.link || '#'}
                    className="notification-message"
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  >
                    {notification.message}
                  </Link>
                  <span className="notification-time">
                    {formatTimeAgo(notification.created_at)}
                  </span>
                </div>
                <div className="notification-actions">
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="btn btn-ghost btn-xs"
                      title="Mark as read"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="btn btn-ghost btn-xs text-red-500"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
