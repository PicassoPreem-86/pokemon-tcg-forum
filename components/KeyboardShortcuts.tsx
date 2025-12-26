'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { X, Keyboard } from 'lucide-react';
import {
  useKeyboardShortcutsStore,
  isInputFocused,
  formatShortcut,
  getShortcutsByCategory,
  CATEGORY_NAMES,
} from '@/lib/keyboard-shortcuts';
import { useAuthStore } from '@/lib/auth-store';

// Help Modal Component
function ShortcutsHelpModal() {
  const { showHelpModal, setShowHelpModal } = useKeyboardShortcutsStore();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (showHelpModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showHelpModal]);

  if (!showHelpModal || !mounted) return null;

  const shortcutsByCategory = getShortcutsByCategory();

  const modalContent = (
    <div className="shortcuts-modal-overlay" onClick={() => setShowHelpModal(false)}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-modal-header">
          <div className="shortcuts-modal-title">
            <Keyboard size={20} />
            <h2>Keyboard Shortcuts</h2>
          </div>
          <button
            className="shortcuts-modal-close"
            onClick={() => setShowHelpModal(false)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="shortcuts-modal-content">
          {Object.entries(shortcutsByCategory).map(([category, shortcuts]) => (
            <div key={category} className="shortcuts-category">
              <h3 className="shortcuts-category-title">
                {CATEGORY_NAMES[category] || category}
              </h3>
              <div className="shortcuts-list">
                {shortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="shortcut-item">
                    <span className="shortcut-description">{shortcut.description}</span>
                    <kbd className="shortcut-key">{formatShortcut(shortcut.key)}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-modal-footer">
          <span className="shortcuts-tip">
            Press <kbd>?</kbd> anytime to show this help
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Selection indicator for navigable items
export function useKeyboardNavigation(itemCount: number) {
  const { selectedIndex, setMaxIndex, resetSelection } = useKeyboardShortcutsStore();

  useEffect(() => {
    setMaxIndex(itemCount);
    return () => resetSelection();
  }, [itemCount, setMaxIndex, resetSelection]);

  return { selectedIndex };
}

// Main keyboard handler component
export default function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const { enabled, pendingCombo, setPendingCombo, clearComboTimeout, moveSelection, selectedIndex, setShowHelpModal } = useKeyboardShortcutsStore();
  const { isAuthenticated } = useAuthStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if shortcuts are disabled
    if (!enabled) return;

    // Skip if typing in an input
    if (isInputFocused()) {
      // But allow Escape to blur
      if (e.key === 'Escape') {
        (document.activeElement as HTMLElement)?.blur();
      }
      // And allow Ctrl+Enter for form submission
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        // Let the form handle this
        return;
      }
      return;
    }

    const key = e.key.toLowerCase();

    // Handle combo shortcuts (g + letter)
    if (pendingCombo === 'g') {
      e.preventDefault();
      clearComboTimeout();

      switch (key) {
        case 'h':
          router.push('/');
          break;
        case 'c':
          router.push('/categories');
          break;
        case 'n':
          if (isAuthenticated) router.push('/notifications');
          break;
        case 'm':
          if (isAuthenticated) router.push('/messages');
          break;
        case 'p':
          if (isAuthenticated) router.push('/settings');
          break;
        case 's':
          router.push('/search');
          break;
      }
      return;
    }

    // Start combo with 'g'
    if (key === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      setPendingCombo('g');
      return;
    }

    // Single key shortcuts
    switch (key) {
      // Show help modal
      case '?':
        e.preventDefault();
        setShowHelpModal(true);
        break;

      // Close modals
      case 'escape':
        setShowHelpModal(false);
        break;

      // Navigation - j/k for up/down
      case 'j':
        e.preventDefault();
        moveSelection('down');
        scrollToSelected('down');
        break;

      case 'k':
        e.preventDefault();
        moveSelection('up');
        scrollToSelected('up');
        break;

      // Open selected item
      case 'o':
      case 'enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          openSelectedItem();
        }
        break;

      // Back to list
      case 'u':
        e.preventDefault();
        if (pathname.startsWith('/thread/')) {
          // Go back to the category or home
          router.back();
        }
        break;

      // New thread
      case 'n':
        if (isAuthenticated && !pathname.startsWith('/new')) {
          e.preventDefault();
          router.push('/new');
        }
        break;

      // Reply
      case 'r':
        if (isAuthenticated && pathname.startsWith('/thread/')) {
          e.preventDefault();
          focusReplyBox();
        }
        break;

      // Focus search
      case '/':
        e.preventDefault();
        focusSearch();
        break;

      // Like/react to selected
      case 'l':
        if (isAuthenticated && selectedIndex >= 0) {
          e.preventDefault();
          likeSelectedItem();
        }
        break;

      // Bookmark
      case 'b':
        if (isAuthenticated && pathname.startsWith('/thread/')) {
          e.preventDefault();
          toggleBookmark();
        }
        break;

      // Subscribe
      case 's':
        // Only if not a combo start and in thread
        if (isAuthenticated && pathname.startsWith('/thread/') && !e.ctrlKey) {
          e.preventDefault();
          toggleSubscribe();
        }
        break;
    }
  }, [enabled, pendingCombo, selectedIndex, pathname, isAuthenticated, router, setPendingCombo, clearComboTimeout, moveSelection, setShowHelpModal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return <ShortcutsHelpModal />;
}

// Helper functions for keyboard actions
function scrollToSelected(direction: 'up' | 'down') {
  // Find the currently selected item and scroll it into view
  setTimeout(() => {
    const selected = document.querySelector('[data-keyboard-selected="true"]');
    if (selected) {
      selected.scrollIntoView({
        behavior: 'smooth',
        block: direction === 'down' ? 'center' : 'center',
      });
    }
  }, 10);
}

function openSelectedItem() {
  const selected = document.querySelector('[data-keyboard-selected="true"]');
  if (selected) {
    const link = selected.querySelector('a[href^="/thread/"]') as HTMLAnchorElement;
    if (link) {
      link.click();
    }
  }
}

function focusReplyBox() {
  const replyTextarea = document.querySelector('.reply-form textarea') as HTMLTextAreaElement;
  if (replyTextarea) {
    replyTextarea.focus();
    replyTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function focusSearch() {
  const searchInput = document.querySelector('.search-input, [data-search-input]') as HTMLInputElement;
  if (searchInput) {
    searchInput.focus();
  } else {
    // Navigate to search page if no search input found
    window.location.href = '/search';
  }
}

function likeSelectedItem() {
  const selected = document.querySelector('[data-keyboard-selected="true"]');
  if (selected) {
    const likeButton = selected.querySelector('[data-reaction-button="like"]') as HTMLButtonElement;
    if (likeButton) {
      likeButton.click();
    }
  }
}

function toggleBookmark() {
  const bookmarkButton = document.querySelector('[data-bookmark-button]') as HTMLButtonElement;
  if (bookmarkButton) {
    bookmarkButton.click();
  }
}

function toggleSubscribe() {
  const subscribeButton = document.querySelector('[data-subscribe-button]') as HTMLButtonElement;
  if (subscribeButton) {
    subscribeButton.click();
  }
}

// Keyboard shortcut indicator component (shows pending combo)
export function KeyboardIndicator() {
  const { enabled, pendingCombo } = useKeyboardShortcutsStore();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !enabled || !pendingCombo) return null;

  return createPortal(
    <div className="keyboard-indicator">
      <kbd>{pendingCombo}</kbd>
      <span>+ ...</span>
    </div>,
    document.body
  );
}
