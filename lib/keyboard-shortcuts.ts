import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Shortcut {
  key: string;
  description: string;
  category: 'navigation' | 'actions' | 'editor' | 'general';
  // For combo shortcuts like g+h (go to home)
  combo?: string;
}

// All available keyboard shortcuts
export const SHORTCUTS: Shortcut[] = [
  // Navigation
  { key: 'j', description: 'Next thread/post', category: 'navigation' },
  { key: 'k', description: 'Previous thread/post', category: 'navigation' },
  { key: 'o', description: 'Open selected thread', category: 'navigation' },
  { key: 'Enter', description: 'Open selected thread', category: 'navigation' },
  { key: 'u', description: 'Back to thread list', category: 'navigation' },
  { key: 'g h', description: 'Go to home', category: 'navigation', combo: 'g+h' },
  { key: 'g c', description: 'Go to categories', category: 'navigation', combo: 'g+c' },
  { key: 'g n', description: 'Go to notifications', category: 'navigation', combo: 'g+n' },
  { key: 'g m', description: 'Go to messages', category: 'navigation', combo: 'g+m' },
  { key: 'g p', description: 'Go to profile', category: 'navigation', combo: 'g+p' },
  { key: 'g s', description: 'Go to settings', category: 'navigation', combo: 'g+s' },

  // Actions
  { key: 'n', description: 'New thread', category: 'actions' },
  { key: 'r', description: 'Reply to thread', category: 'actions' },
  { key: '/', description: 'Focus search', category: 'actions' },
  { key: 's', description: 'Toggle subscribe', category: 'actions' },
  { key: 'b', description: 'Toggle bookmark', category: 'actions' },
  { key: 'l', description: 'Like/react', category: 'actions' },

  // Editor
  { key: 'Ctrl+Enter', description: 'Submit reply', category: 'editor' },
  { key: 'Ctrl+b', description: 'Bold text', category: 'editor' },
  { key: 'Ctrl+i', description: 'Italic text', category: 'editor' },
  { key: 'Ctrl+k', description: 'Insert link', category: 'editor' },
  { key: 'Ctrl+Shift+c', description: 'Insert code', category: 'editor' },

  // General
  { key: '?', description: 'Show keyboard shortcuts', category: 'general' },
  { key: 'Escape', description: 'Close modal/cancel', category: 'general' },
];

interface KeyboardShortcutsState {
  // Settings
  enabled: boolean;
  showHelpModal: boolean;

  // For combo shortcuts (e.g., g then h)
  pendingCombo: string | null;
  comboTimeout: NodeJS.Timeout | null;

  // Currently selected item index (for j/k navigation)
  selectedIndex: number;
  maxIndex: number;

  // Actions
  setEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
  setShowHelpModal: (show: boolean) => void;
  toggleHelpModal: () => void;
  setPendingCombo: (key: string | null) => void;
  clearComboTimeout: () => void;
  setSelectedIndex: (index: number) => void;
  setMaxIndex: (max: number) => void;
  moveSelection: (direction: 'up' | 'down') => void;
  resetSelection: () => void;
}

export const useKeyboardShortcutsStore = create<KeyboardShortcutsState>()(
  persist(
    (set, get) => ({
      enabled: true,
      showHelpModal: false,
      pendingCombo: null,
      comboTimeout: null,
      selectedIndex: -1,
      maxIndex: 0,

      setEnabled: (enabled) => set({ enabled }),
      toggleEnabled: () => set((state) => ({ enabled: !state.enabled })),

      setShowHelpModal: (show) => set({ showHelpModal: show }),
      toggleHelpModal: () => set((state) => ({ showHelpModal: !state.showHelpModal })),

      setPendingCombo: (key) => {
        const { comboTimeout } = get();
        if (comboTimeout) {
          clearTimeout(comboTimeout);
        }

        if (key) {
          // Set a timeout to clear the pending combo after 1 second
          const timeout = setTimeout(() => {
            set({ pendingCombo: null, comboTimeout: null });
          }, 1000);
          set({ pendingCombo: key, comboTimeout: timeout });
        } else {
          set({ pendingCombo: null, comboTimeout: null });
        }
      },

      clearComboTimeout: () => {
        const { comboTimeout } = get();
        if (comboTimeout) {
          clearTimeout(comboTimeout);
        }
        set({ pendingCombo: null, comboTimeout: null });
      },

      setSelectedIndex: (index) => set({ selectedIndex: index }),
      setMaxIndex: (max) => set({ maxIndex: max }),

      moveSelection: (direction) => {
        const { selectedIndex, maxIndex } = get();
        if (direction === 'down') {
          const newIndex = selectedIndex < maxIndex - 1 ? selectedIndex + 1 : selectedIndex;
          set({ selectedIndex: newIndex });
        } else {
          const newIndex = selectedIndex > 0 ? selectedIndex - 1 : 0;
          set({ selectedIndex: newIndex });
        }
      },

      resetSelection: () => set({ selectedIndex: -1 }),
    }),
    {
      name: 'tcg-forum-keyboard-shortcuts',
      partialize: (state) => ({ enabled: state.enabled }),
    }
  )
);

// Check if we're in an input field (should disable most shortcuts)
export function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isEditable = activeElement.getAttribute('contenteditable') === 'true';

  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || isEditable;
}

// Get shortcut display text (for showing in UI)
export function formatShortcut(key: string): string {
  return key
    .replace('Ctrl+', '⌘')
    .replace('Shift+', '⇧')
    .replace('Alt+', '⌥')
    .replace('Enter', '↵')
    .replace('Escape', 'Esc');
}

// Group shortcuts by category
export function getShortcutsByCategory(): Record<string, Shortcut[]> {
  const grouped: Record<string, Shortcut[]> = {};

  for (const shortcut of SHORTCUTS) {
    if (!grouped[shortcut.category]) {
      grouped[shortcut.category] = [];
    }
    grouped[shortcut.category].push(shortcut);
  }

  return grouped;
}

// Category display names
export const CATEGORY_NAMES: Record<string, string> = {
  navigation: 'Navigation',
  actions: 'Actions',
  editor: 'Editor',
  general: 'General',
};
