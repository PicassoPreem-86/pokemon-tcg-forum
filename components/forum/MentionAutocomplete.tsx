'use client';

import { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import Image from 'next/image';
import { User, Loader2 } from 'lucide-react';
import { searchUsersForMention } from '@/lib/mentions';
import { useAuthStore } from '@/lib/auth-store';

interface MentionUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface MentionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  maxRows?: number;
  disabled?: boolean;
  id?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const MentionAutocomplete = forwardRef<HTMLTextAreaElement, MentionAutocompleteProps>(
  function MentionAutocomplete(
    {
      value,
      onChange,
      placeholder,
      className = '',
      minRows = 3,
      maxRows = 10,
      disabled = false,
      id,
      onFocus,
      onBlur,
    },
    forwardedRef
  ) {
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState<MentionUser[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [mentionStart, setMentionStart] = useState<number | null>(null);
    const [mentionQuery, setMentionQuery] = useState('');

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();

    // Combine refs
    const setRefs = useCallback(
      (element: HTMLTextAreaElement | null) => {
        textareaRef.current = element;
        if (typeof forwardedRef === 'function') {
          forwardedRef(element);
        } else if (forwardedRef) {
          forwardedRef.current = element;
        }
      },
      [forwardedRef]
    );

    // Detect @ mentions in the text
    const detectMention = useCallback((text: string, cursorPos: number) => {
      // Look backwards from cursor to find @
      let start = cursorPos - 1;
      while (start >= 0) {
        const char = text[start];
        // Stop at whitespace or line break
        if (/\s/.test(char)) {
          return null;
        }
        // Found @
        if (char === '@') {
          const query = text.slice(start + 1, cursorPos);
          // Only trigger if query is alphanumeric/underscore
          if (/^\w*$/.test(query)) {
            return { start, query };
          }
          return null;
        }
        start--;
      }
      return null;
    }, []);

    // Handle text changes
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart;

        onChange(newValue);

        // Check for active mention
        const mention = detectMention(newValue, cursorPos);
        if (mention) {
          setMentionStart(mention.start);
          setMentionQuery(mention.query);
          setIsOpen(true);
          setSelectedIndex(0);
        } else {
          setIsOpen(false);
          setMentionStart(null);
          setMentionQuery('');
        }
      },
      [onChange, detectMention]
    );

    // Search for users when mention query changes
    useEffect(() => {
      if (!isOpen || mentionQuery.length < 1) {
        setUsers([]);
        return;
      }

      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout;

      const search = async () => {
        setIsLoading(true);
        try {
          const results = await searchUsersForMention(mentionQuery, user?.id);
          if (!controller.signal.aborted) {
            setUsers(results);
          }
        } catch (error) {
          console.error('Failed to search users:', error);
          if (!controller.signal.aborted) {
            setUsers([]);
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        }
      };

      // Debounce the search
      timeoutId = setTimeout(search, 150);

      return () => {
        controller.abort();
        clearTimeout(timeoutId);
      };
    }, [isOpen, mentionQuery, user?.id]);

    // Insert selected user
    const insertMention = useCallback(
      (username: string) => {
        if (mentionStart === null || !textareaRef.current) return;

        const before = value.slice(0, mentionStart);
        const cursorPos = textareaRef.current.selectionStart;
        const after = value.slice(cursorPos);

        const newValue = `${before}@${username} ${after}`;
        onChange(newValue);

        // Close dropdown and reset
        setIsOpen(false);
        setMentionStart(null);
        setMentionQuery('');
        setUsers([]);

        // Set cursor position after the inserted mention
        const newCursorPos = mentionStart + username.length + 2; // @ + username + space
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);
      },
      [mentionStart, value, onChange]
    );

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isOpen || users.length === 0) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % users.length);
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + users.length) % users.length);
            break;
          case 'Enter':
          case 'Tab':
            if (users[selectedIndex]) {
              e.preventDefault();
              insertMention(users[selectedIndex].username);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setIsOpen(false);
            break;
        }
      },
      [isOpen, users, selectedIndex, insertMention]
    );

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node) &&
          textareaRef.current &&
          !textareaRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto-resize textarea
    useEffect(() => {
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
        const minHeight = lineHeight * minRows;
        const maxHeight = lineHeight * maxRows;
        const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${newHeight}px`;
      }
    }, [value, minRows, maxRows]);

    return (
      <div className="relative">
        <textarea
          ref={setRefs}
          id={id}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full resize-none ${className}`}
          style={{ minHeight: `${minRows * 24}px` }}
        />

        {/* Autocomplete dropdown */}
        {isOpen && (users.length > 0 || isLoading) && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-lg overflow-hidden"
          >
            {isLoading && users.length === 0 ? (
              <div className="flex items-center justify-center py-3 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Searching...</span>
              </div>
            ) : (
              <ul className="py-1">
                {users.map((mentionUser, index) => (
                  <li key={mentionUser.id}>
                    <button
                      type="button"
                      onClick={() => insertMention(mentionUser.username)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                        index === selectedIndex
                          ? 'bg-purple-600/30 text-white'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                        {mentionUser.avatar_url ? (
                          <Image
                            src={mentionUser.avatar_url}
                            alt={mentionUser.username}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          @{mentionUser.username}
                        </div>
                        {mentionUser.display_name && mentionUser.display_name !== mentionUser.username && (
                          <div className="text-xs text-slate-400 truncate">
                            {mentionUser.display_name}
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!isLoading && users.length === 0 && mentionQuery.length >= 1 && (
              <div className="px-3 py-2 text-sm text-slate-400">
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default MentionAutocomplete;
