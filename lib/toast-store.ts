import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = generateToastId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000, // Default 4 seconds
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// Helper functions for common toast types
export function showSuccessToast(title: string, message?: string) {
  useToastStore.getState().addToast({ type: 'success', title, message });
}

export function showErrorToast(title: string, message?: string) {
  useToastStore.getState().addToast({ type: 'error', title, message });
}

export function showInfoToast(title: string, message?: string) {
  useToastStore.getState().addToast({ type: 'info', title, message });
}

export function showWarningToast(title: string, message?: string) {
  useToastStore.getState().addToast({ type: 'warning', title, message });
}

// Notification-specific toast helper
export function showNotificationToast(message: string, type: 'reply' | 'mention' | 'like' | 'follow' | 'badge') {
  const titles: Record<string, string> = {
    reply: 'New Reply',
    mention: 'You were mentioned',
    like: 'New Like',
    follow: 'New Follower',
    badge: 'Badge Earned',
  };
  useToastStore.getState().addToast({
    type: 'info',
    title: titles[type] || 'Notification',
    message,
    duration: 5000,
  });
}
