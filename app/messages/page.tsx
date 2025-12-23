'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Loader2,
  ArrowLeft,
  MessageSquare,
  Search,
  Plus,
} from 'lucide-react';
import { useAuth, useRealtimeNotifications } from '@/lib/hooks';
import type { RealtimeNotification } from '@/lib/hooks';
import { getConversations } from '@/lib/actions';
import type { Conversation } from '@/lib/actions/action-types';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Fetch conversations
  useEffect(() => {
    async function fetchConversations() {
      if (!user) return;

      try {
        const data = await getConversations(50);
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isHydrated && user) {
      fetchConversations();
    }
  }, [isHydrated, user]);

  // Handle new message notification - refresh conversations
  const handleNewNotification = React.useCallback((notification: RealtimeNotification) => {
    if (notification.type === 'message') {
      // Refresh conversations list when new message arrives
      getConversations(50).then(setConversations).catch(console.error);
    }
  }, []);

  // Subscribe to notifications for new message alerts
  useRealtimeNotifications(user?.id, {
    onInsert: handleNewNotification,
    enabled: isHydrated && isAuthenticated && !!user,
  });

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const otherUser = conv.other_user;
    if (!otherUser) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      otherUser.username.toLowerCase().includes(searchLower) ||
      (otherUser.display_name?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

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
            <Mail className="inline-block mr-2" size={28} />
            Messages
            {totalUnread > 0 && (
              <span className="notification-badge-header">{totalUnread}</span>
            )}
          </h1>
          <p>Private conversations with other trainers</p>
        </div>

        {/* Search & New Message */}
        <div className="messages-toolbar">
          <div className="messages-search">
            <Search size={18} className="messages-search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="messages-search-input"
            />
          </div>
          <Link href="/messages/new" className="btn btn-primary">
            <Plus size={18} />
            New Message
          </Link>
        </div>

        {/* Conversations List */}
        {isLoading ? (
          <div className="settings-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={64} className="empty-state-icon" />
            <h3>{searchQuery ? 'No conversations found' : 'No messages yet'}</h3>
            <p>
              {searchQuery
                ? 'Try a different search term'
                : 'Start a conversation with another trainer!'}
            </p>
            {!searchQuery && (
              <Link href="/messages/new" className="btn btn-primary mt-4">
                <Plus size={18} />
                Start a Conversation
              </Link>
            )}
          </div>
        ) : (
          <div className="conversations-list">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.other_user;
              if (!otherUser) return null;

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${otherUser.id}`}
                  className={`conversation-item ${(conversation.unread_count || 0) > 0 ? 'unread' : ''}`}
                >
                  <div className="conversation-avatar">
                    <Image
                      src={otherUser.avatar_url || '/images/avatars/default.png'}
                      alt={otherUser.display_name || otherUser.username}
                      width={48}
                      height={48}
                    />
                    {(conversation.unread_count || 0) > 0 && (
                      <span className="conversation-unread-dot" />
                    )}
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <span className="conversation-name">
                        {otherUser.display_name || otherUser.username}
                      </span>
                      <span className="conversation-time">
                        {formatTimeAgo(conversation.last_message_at)}
                      </span>
                    </div>
                    <div className="conversation-preview">
                      {conversation.last_message ? (
                        <>
                          {conversation.last_message.sender_id === user.id && (
                            <span className="conversation-you">You: </span>
                          )}
                          <span className="conversation-message">
                            {conversation.last_message.content.length > 60
                              ? conversation.last_message.content.substring(0, 60) + '...'
                              : conversation.last_message.content}
                          </span>
                        </>
                      ) : (
                        <span className="conversation-empty">No messages yet</span>
                      )}
                    </div>
                  </div>
                  {(conversation.unread_count || 0) > 0 && (
                    <span className="conversation-badge">{conversation.unread_count}</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
