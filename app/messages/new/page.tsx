'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Search, Send, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { sendDirectMessage } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';

interface SearchResult {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function NewMessagePage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [message, setMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
          .neq('id', user?.id)
          .limit(10);

        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user?.id]);

  const handleSelectUser = (selectedResult: SearchResult) => {
    setSelectedUser(selectedResult);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !message.trim() || isSending) return;

    setIsSending(true);
    try {
      const result = await sendDirectMessage({
        recipientId: selectedUser.id,
        content: message.trim(),
      });

      if (result.success) {
        router.push(`/messages/${selectedUser.id}`);
      } else {
        console.error('Failed to send message:', result.error);
        alert(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

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
      <div className="settings-container" style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="settings-header">
          <Link href="/messages" className="settings-back">
            <ArrowLeft size={20} />
            Back to Messages
          </Link>
          <h1>
            <Send className="inline-block mr-2" size={28} />
            New Message
          </h1>
          <p>Start a conversation with another trainer</p>
        </div>

        {/* Recipient Selection */}
        <div className="new-message-form">
          <div className="form-group">
            <label>To:</label>
            {selectedUser ? (
              <div className="selected-recipient">
                <Image
                  src={selectedUser.avatar_url || '/images/avatars/default.png'}
                  alt={selectedUser.display_name || selectedUser.username}
                  width={32}
                  height={32}
                  className="selected-recipient-avatar"
                />
                <span className="selected-recipient-name">
                  {selectedUser.display_name || selectedUser.username}
                </span>
                <span className="selected-recipient-username">@{selectedUser.username}</span>
                <button
                  type="button"
                  className="selected-recipient-remove"
                  onClick={() => setSelectedUser(null)}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="recipient-search">
                <div className="recipient-search-input-wrapper">
                  <Search size={18} className="recipient-search-icon" />
                  <input
                    type="text"
                    placeholder="Search for a user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="recipient-search-input"
                  />
                  {isSearching && <Loader2 size={18} className="spin recipient-search-loader" />}
                </div>
                {searchResults.length > 0 && (
                  <div className="recipient-search-results">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        className="recipient-search-result"
                        onClick={() => handleSelectUser(result)}
                      >
                        <Image
                          src={result.avatar_url || '/images/avatars/default.png'}
                          alt={result.display_name || result.username}
                          width={36}
                          height={36}
                        />
                        <div className="recipient-result-info">
                          <span className="recipient-result-name">
                            {result.display_name || result.username}
                          </span>
                          <span className="recipient-result-username">@{result.username}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                  <div className="recipient-search-empty">
                    <User size={24} />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage}>
            <div className="form-group">
              <label>Message:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                disabled={!selectedUser || isSending}
                className="message-textarea"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={!selectedUser || !message.trim() || isSending}
            >
              {isSending ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
