/**
 * useAuth Hook Tests
 *
 * These tests verify the authentication hook functionality including:
 * - Initial authentication state loading
 * - User profile fetching and caching
 * - Auth state change handling (sign in, sign out, token refresh)
 * - Role checking helper functions
 * - Proper cleanup and subscription management
 *
 * Run with: npm test use-auth.test.tsx
 */

import React from 'react';
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth, AuthProvider, isUserAdmin, isUserModerator } from '../hooks/use-auth';
import type { AuthUser } from '../hooks/use-auth';
import type { User } from '@supabase/supabase-js';

// Mock Supabase client
const createMockSupabaseClient = () => {
  const authStateChangeCallbacks: Array<(event: string, session: unknown) => void> = [];

  return {
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn((callback: (event: string, session: unknown) => void) => {
        authStateChangeCallbacks.push(callback);
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      }),
    },
    from: jest.fn(),
    // Helper to trigger auth state changes in tests
    __triggerAuthStateChange: (event: string, session: unknown) => {
      authStateChangeCallbacks.forEach(cb => cb(event, session));
    },
    __authStateChangeCallbacks: authStateChangeCallbacks,
  };
};

type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;

jest.mock('../supabase/client', () => ({
  getSupabaseClient: jest.fn(),
}));

describe('useAuth Hook', () => {
  let mockSupabase: MockSupabaseClient;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();

    const { getSupabaseClient } = require('../supabase/client');
    getSupabaseClient.mockReturnValue(mockSupabase);

    // Clear any previous subscriptions
    if (mockSupabase.__authStateChangeCallbacks) {
      mockSupabase.__authStateChangeCallbacks.length = 0;
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Authentication State', () => {
    it('should start with loading state', () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should hydrate immediately on mount', () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isHydrated).toBe(true);
    });
  });

  describe('User Profile Fetching', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01',
    };

    const mockProfile: AuthUser = {
      id: 'user-123',
      username: 'testuser',
      display_name: 'Test User',
      email: 'test@example.com',
      role: 'member',
      avatar_url: null,
      bio: null,
      location: null,
      signature: null,
      reputation: 0,
      post_count: 0,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      badges: [],
      is_banned: false,
      last_seen_at: null,
    };

    it('should fetch user profile when authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockProfile);
      expect(result.current.supabaseUser).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle profile fetch errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Profile not found' },
            })),
          })),
        })),
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should remain unauthenticated when no user exists', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.supabaseUser).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Auth State Changes', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01',
    };

    const mockProfile: AuthUser = {
      id: 'user-123',
      username: 'testuser',
      display_name: 'Test User',
      email: 'test@example.com',
      role: 'member',
      avatar_url: null,
      bio: null,
      location: null,
      signature: null,
      reputation: 0,
      post_count: 0,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      badges: [],
      is_banned: false,
      last_seen_at: null,
    };

    it('should update state on SIGNED_IN event', async () => {
      // Start with no user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Setup profile fetch for sign in
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      });

      // Trigger sign in
      await act(async () => {
        mockSupabase.__triggerAuthStateChange('SIGNED_IN', {
          user: mockUser,
          access_token: 'token123',
        });

        // Wait for profile fetch
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockProfile);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should update state on SIGNED_OUT event', async () => {
      // Start with authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockProfile);
      });

      // Trigger sign out
      await act(async () => {
        mockSupabase.__triggerAuthStateChange('SIGNED_OUT', null);
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should update state on TOKEN_REFRESHED event', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockProfile);
      });

      const updatedProfile = { ...mockProfile, display_name: 'Updated Name' };

      // Update mock for refreshed profile
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: updatedProfile,
              error: null,
            })),
          })),
        })),
      });

      // Trigger token refresh
      await act(async () => {
        mockSupabase.__triggerAuthStateChange('TOKEN_REFRESHED', {
          user: mockUser,
          access_token: 'new-token',
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.user?.display_name).toBe('Updated Name');
      });
    });
  });

  describe('refreshUser', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01',
    };

    const mockProfile: AuthUser = {
      id: 'user-123',
      username: 'testuser',
      display_name: 'Test User',
      email: 'test@example.com',
      role: 'member',
      avatar_url: null,
      bio: null,
      location: null,
      signature: null,
      reputation: 0,
      post_count: 0,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      badges: [],
      is_banned: false,
      last_seen_at: null,
    };

    it('should manually refresh user profile', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockProfile);
      });

      const updatedProfile = { ...mockProfile, display_name: 'Manually Updated' };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: updatedProfile,
              error: null,
            })),
          })),
        })),
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user?.display_name).toBe('Manually Updated');
    });

    it('should handle errors during manual refresh', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockProfile);
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Make getUser fail
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Subscription Cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const unsubscribeMock = jest.fn();
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: unsubscribeMock,
          },
        },
      });

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});

describe('Role Helper Functions', () => {
  const memberUser: AuthUser = {
    id: 'user-1',
    username: 'member',
    display_name: 'Member User',
    email: 'member@example.com',
    role: 'member',
    avatar_url: null,
    bio: null,
    location: null,
    signature: null,
    reputation: 0,
    post_count: 0,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    badges: [],
    is_banned: false,
    last_seen_at: null,
  };

  const moderatorUser: AuthUser = {
    ...memberUser,
    id: 'user-2',
    username: 'moderator',
    role: 'moderator',
  };

  const adminUser: AuthUser = {
    ...memberUser,
    id: 'user-3',
    username: 'admin',
    role: 'admin',
  };

  describe('isUserAdmin', () => {
    it('should return true for admin users', () => {
      expect(isUserAdmin(adminUser)).toBe(true);
    });

    it('should return false for moderator users', () => {
      expect(isUserAdmin(moderatorUser)).toBe(false);
    });

    it('should return false for member users', () => {
      expect(isUserAdmin(memberUser)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(isUserAdmin(null)).toBe(false);
    });
  });

  describe('isUserModerator', () => {
    it('should return true for admin users', () => {
      expect(isUserModerator(adminUser)).toBe(true);
    });

    it('should return true for moderator users', () => {
      expect(isUserModerator(moderatorUser)).toBe(true);
    });

    it('should return false for member users', () => {
      expect(isUserModerator(memberUser)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(isUserModerator(null)).toBe(false);
    });
  });
});
