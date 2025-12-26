import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';
import { User, UserRole, UserBadge } from './types';
import { useBadgeStore } from './badge-store';

// Auth user extends base User with email
export interface AuthUser extends User {
  email: string;
}

// Registration data
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Auth store state
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  clearError: () => void;
}

// Mock user database (stored in localStorage)
const USERS_STORAGE_KEY = 'pokemon_tcg_forum_users';

// Get stored users
function getStoredUsers(): Map<string, AuthUser & { password: string }> {
  if (typeof window === 'undefined') return new Map();

  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) return new Map();

  try {
    const users = JSON.parse(stored);
    return new Map(Object.entries(users));
  } catch {
    return new Map();
  }
}

// Save users to storage
function saveUsers(users: Map<string, AuthUser & { password: string }>) {
  if (typeof window === 'undefined') return;

  const obj = Object.fromEntries(users);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(obj));
}

// Default badges for new users
const DEFAULT_BADGES: UserBadge[] = [
  {
    id: 'badge-new-trainer',
    name: 'New Trainer',
    icon: 'Sparkles',
    color: '#10B981',
  },
];

// Generate unique user ID
function generateUserId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Create the auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const users = getStoredUsers();

        // Find user by email
        let foundUser: (AuthUser & { password: string }) | undefined;
        users.forEach((user) => {
          if (user.email.toLowerCase() === credentials.email.toLowerCase()) {
            foundUser = user;
          }
        });

        if (!foundUser) {
          set({ isLoading: false, error: 'No account found with this email address.' });
          return false;
        }

        if (foundUser.password !== credentials.password) {
          set({ isLoading: false, error: 'Incorrect password. Please try again.' });
          return false;
        }

        // Remove password from user object before storing
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Destructuring to exclude password
        const { password: excludedPassword, ...userWithoutPassword } = foundUser;

        set({
          user: { ...userWithoutPassword, isOnline: true },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Record visit for badges
        useBadgeStore.getState().recordVisit();

        return true;
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const users = getStoredUsers();

        // Check if email already exists
        let emailExists = false;
        let usernameExists = false;

        users.forEach((user) => {
          if (user.email.toLowerCase() === data.email.toLowerCase()) {
            emailExists = true;
          }
          if (user.username.toLowerCase() === data.username.toLowerCase()) {
            usernameExists = true;
          }
        });

        if (emailExists) {
          set({ isLoading: false, error: 'An account with this email already exists.' });
          return false;
        }

        if (usernameExists) {
          set({ isLoading: false, error: 'This username is already taken.' });
          return false;
        }

        // Validate username
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) {
          set({
            isLoading: false,
            error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores.'
          });
          return false;
        }

        // Create new user
        const newUser: AuthUser & { password: string } = {
          id: generateUserId(),
          username: data.username,
          email: data.email,
          password: data.password,
          displayName: data.displayName || data.username,
          role: 'newbie' as UserRole,
          joinDate: new Date().toISOString(),
          postCount: 0,
          reputation: 0,
          isOnline: true,
          badges: DEFAULT_BADGES,
        };

        // Save to storage
        users.set(data.email.toLowerCase(), newUser);
        saveUsers(users);

        // Remove password from user object before storing in state
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Destructuring to exclude password
        const { password: excludedPassword, ...userWithoutPassword } = newUser;

        set({
          user: userWithoutPassword,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Award newcomer badge and record first visit
        const badgeStore = useBadgeStore.getState();
        badgeStore.recordVisit();
        badgeStore.checkAndAwardBadges(); // This will award 'newcomer' badge

        return true;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateProfile: (updates: Partial<AuthUser>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...updates };

        // Update in storage
        const users = getStoredUsers();
        const storedUser = users.get(currentUser.email.toLowerCase());
        if (storedUser) {
          users.set(currentUser.email.toLowerCase(), { ...storedUser, ...updates });
          saveUsers(users);
        }

        set({ user: updatedUser });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'pokemon-tcg-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper to read auth state from localStorage
function getAuthFromLocalStorage(): { user: AuthUser | null; isAuthenticated: boolean } {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }

  try {
    const storedAuth = localStorage.getItem('pokemon-tcg-auth');
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      if (parsed.state) {
        return {
          user: parsed.state.user || null,
          isAuthenticated: parsed.state.isAuthenticated || false,
        };
      }
    }
  } catch {
    // Ignore parse errors
  }

  return { user: null, isAuthenticated: false };
}

// Alternative: Direct subscription-based hook for auth state
// This ensures we get the latest state after hydration
export function useAuthStateAfterHydration() {
  // Start with false for SSR, will be set to true after mount
  const [isHydrated, setIsHydrated] = useState(false);

  // Force re-render counter
  const [, forceUpdate] = useState(0);

  // Read current state - will be empty on SSR, populated on client
  const currentState = isHydrated ? getAuthFromLocalStorage() : { user: null, isAuthenticated: false };

  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);

    // Force a re-render to pick up localStorage values
    forceUpdate((n) => n + 1);

    // Subscribe to store changes for future updates
    const unsubscribe = useAuthStore.subscribe(() => {
      forceUpdate((n) => n + 1);
    });

    return unsubscribe;
  }, []);

  return {
    user: currentState.user,
    isAuthenticated: currentState.isAuthenticated,
    isHydrated,
  };
}

// Demo account for easy testing
export const DEMO_ACCOUNT = {
  email: 'demo@pokemontcg.com',
  password: 'demo123',
};

// Admin account for testing admin features
export const ADMIN_ACCOUNT = {
  email: 'admin@pokemontcg.com',
  password: 'admin123',
};

// Check if user is admin
export function isUserAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

// Check if user is moderator or admin
export function isUserModerator(user: AuthUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'moderator';
}

// Initialize demo account on first load
export function initializeDemoAccount() {
  if (typeof window === 'undefined') return;

  const users = getStoredUsers();
  let needsSave = false;

  if (!users.has(DEMO_ACCOUNT.email)) {
    const demoUser: AuthUser & { password: string } = {
      id: 'user-demo',
      username: 'DemoTrainer',
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
      displayName: 'Demo Trainer',
      role: 'member' as UserRole,
      joinDate: '2024-01-15T00:00:00Z',
      postCount: 42,
      reputation: 256,
      location: 'Pallet Town',
      bio: 'Just a Pokemon trainer exploring the TCG world!',
      isOnline: true,
      badges: [
        { id: 'badge-1', name: 'Founding Member', icon: 'Crown', color: '#F59E0B' },
        { id: 'badge-2', name: 'Active Collector', icon: 'Star', color: '#8B5CF6' },
        { id: 'badge-3', name: 'Helpful Trader', icon: 'Heart', color: '#EF4444' },
      ],
    };

    users.set(DEMO_ACCOUNT.email, demoUser);
    needsSave = true;
  }

  // Initialize admin account
  if (!users.has(ADMIN_ACCOUNT.email)) {
    const adminUser: AuthUser & { password: string } = {
      id: 'user-admin',
      username: 'PikachuAdmin',
      email: ADMIN_ACCOUNT.email,
      password: ADMIN_ACCOUNT.password,
      displayName: 'Pikachu Admin',
      avatar: '/images/avatars/admin.png',
      role: 'admin' as UserRole,
      joinDate: '2023-01-01T00:00:00Z',
      postCount: 1247,
      reputation: 9999,
      location: 'Pokemon League HQ',
      bio: 'Forum Administrator - Here to help!',
      isOnline: true,
      badges: [
        { id: 'badge-admin', name: 'Administrator', icon: 'Shield', color: '#EF4444' },
        { id: 'badge-founder', name: 'Founder', icon: 'Crown', color: '#F59E0B' },
        { id: 'badge-verified', name: 'Verified', icon: 'CheckCircle', color: '#10B981' },
      ],
    };

    users.set(ADMIN_ACCOUNT.email, adminUser);
    needsSave = true;
  }

  if (needsSave) {
    saveUsers(users);
  }
}
