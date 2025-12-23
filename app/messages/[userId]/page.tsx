'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Send,
  MoreVertical,
  Ban,
  Trash2,
  User,
} from 'lucide-react';
import { useAuth, useRealtimeMessages } from '@/lib/hooks';
import type { RealtimeDirectMessage } from '@/lib/hooks';
import {
  getMessages,
  sendDirectMessage,
  markMessagesAsRead,
  deleteMessage,
  blockUser,
} from '@/lib/actions';
import type { DirectMessage } from '@/lib/actions/action-types';
import { createClient } from '@/lib/supabase/client';

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function shouldShowDateHeader(current: string, previous: string | null): boolean {
  if (!previous) return true;
  const currentDate = new Date(current).toDateString();
  const previousDate = new Date(previous).toDateString();
  return currentDate !== previousDate;
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const otherUserId = params.userId as string;
  const { user, isAuthenticated, isHydrated } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [otherUser, setOtherUser] = useState<{
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Fetch other user's profile
  useEffect(() => {
    async function fetchOtherUser() {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', otherUserId)
        .single();

      if (data) {
        setOtherUser(data);
      } else {
        router.push('/messages');
      }
    }

    if (otherUserId) {
      fetchOtherUser();
    }
  }, [otherUserId, router]);

  // Fetch messages
  useEffect(() => {
    async function fetchMessages() {
      if (!user || !otherUserId) return;

      try {
        const data = await getMessages(otherUserId, 100);
        setMessages(data);

        // Get conversation ID from first message if exists
        if (data.length > 0) {
          setConversationId(data[0].conversation_id);
        }

        // Mark messages as read
        await markMessagesAsRead(otherUserId);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isHydrated && user && otherUserId) {
      fetchMessages();
    }
  }, [isHydrated, user, otherUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle new message from realtime subscription
  const handleNewMessage = React.useCallback(
    (message: RealtimeDirectMessage) => {
      setMessages((prev) => {
        // Check if message already exists
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, { ...message, sender: undefined }];
      });

      // Mark as read if we're the recipient
      if (message.sender_id !== user?.id) {
        markMessagesAsRead(otherUserId);
      }
    },
    [user?.id, otherUserId]
  );

  // Handle message update
  const handleMessageUpdate = React.useCallback((message: RealtimeDirectMessage) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === message.id ? { ...m, is_read: message.is_read, deleted_at: message.deleted_at } : m
      )
    );
  }, []);

  // Subscribe to real-time message updates
  useRealtimeMessages(conversationId, {
    onInsert: handleNewMessage,
    onUpdate: handleMessageUpdate,
    enabled: isHydrated && isAuthenticated && !!user && !!conversationId,
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const result = await sendDirectMessage({
        recipientId: otherUserId,
        content: newMessage.trim(),
      });

      if (result.success) {
        setNewMessage('');
        // Set conversation ID if this was the first message
        if (result.conversationId && !conversationId) {
          setConversationId(result.conversationId);
        }
        inputRef.current?.focus();
      } else {
        console.error('Failed to send message:', result.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const result = await deleteMessage(messageId);
    if (result.success) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
  };

  const handleBlockUser = async () => {
    if (!confirm(`Are you sure you want to block ${otherUser?.username}? They won't be able to message you.`)) {
      return;
    }

    const result = await blockUser(otherUserId);
    if (result.success) {
      router.push('/messages');
    }
    setShowMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Show loading while checking auth
  if (!isHydrated) {
    return (
      <div className="messages-page">
        <div className="messages-loading">
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
    <div className="conversation-page">
      {/* Header */}
      <div className="conversation-header">
        <Link href="/messages" className="conversation-back">
          <ArrowLeft size={20} />
        </Link>
        {otherUser ? (
          <Link href={`/u/${otherUser.username}`} className="conversation-user">
            <Image
              src={otherUser.avatar_url || '/images/avatars/default.png'}
              alt={otherUser.display_name || otherUser.username}
              width={40}
              height={40}
              className="conversation-user-avatar"
            />
            <div className="conversation-user-info">
              <span className="conversation-user-name">
                {otherUser.display_name || otherUser.username}
              </span>
              <span className="conversation-user-username">@{otherUser.username}</span>
            </div>
          </Link>
        ) : (
          <div className="conversation-user-loading">
            <Loader2 size={20} className="spin" />
          </div>
        )}
        <div className="conversation-menu-wrapper">
          <button
            className="conversation-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Menu"
          >
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="conversation-menu">
              <Link
                href={`/u/${otherUser?.username}`}
                className="conversation-menu-item"
                onClick={() => setShowMenu(false)}
              >
                <User size={16} />
                View Profile
              </Link>
              <button className="conversation-menu-item danger" onClick={handleBlockUser}>
                <Ban size={16} />
                Block User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="conversation-messages">
        {isLoading ? (
          <div className="messages-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="messages-empty">
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const showHeader = shouldShowDateHeader(
                message.created_at,
                previousMessage?.created_at || null
              );
              const isOwnMessage = message.sender_id === user.id;

              return (
                <React.Fragment key={message.id}>
                  {showHeader && (
                    <div className="message-date-header">
                      <span>{formatDateHeader(message.created_at)}</span>
                    </div>
                  )}
                  <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
                    {!isOwnMessage && otherUser && (
                      <Image
                        src={otherUser.avatar_url || '/images/avatars/default.png'}
                        alt={otherUser.username}
                        width={32}
                        height={32}
                        className="message-avatar"
                      />
                    )}
                    <div className="message-bubble">
                      <p className="message-content">{message.content}</p>
                      <span className="message-time">{formatTime(message.created_at)}</span>
                    </div>
                    {isOwnMessage && (
                      <button
                        className="message-delete"
                        onClick={() => handleDeleteMessage(message.id)}
                        title="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form className="conversation-input" onSubmit={handleSendMessage}>
        <textarea
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={isSending}
        />
        <button
          type="submit"
          className="conversation-send"
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
}
