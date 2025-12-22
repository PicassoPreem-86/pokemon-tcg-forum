/**
 * Auth Actions Tests
 *
 * These tests verify authentication functionality including:
 * - User sign up with validation
 * - User sign in with credentials
 * - Sign out functionality
 * - Profile updates with rate limiting
 * - Password reset and update
 *
 * Run with: npm test auth.test.ts
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { signUp, signIn, signOut, updateProfile, resetPassword, updatePassword } from '../actions/auth';

// Mock Next.js functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(() => Promise.resolve({
    get: jest.fn((key: string) => {
      if (key === 'origin') return 'http://localhost:3000';
      return null;
    }),
  })),
}));

// Mock rate limiting
jest.mock('../rate-limit', () => ({
  checkRateLimit: jest.fn(() => Promise.resolve({ allowed: true, remaining: 9 })),
  formatRetryTime: jest.fn((seconds: number) => Promise.resolve(`${seconds} seconds`)),
}));

// Create mock Supabase client
const createMockSupabaseClient = () => {
  const mockClient = {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  };
  return mockClient;
};

// Mock Supabase server
jest.mock('../supabase/server', () => ({
  createClient: jest.fn(),
  createActionClient: jest.fn(),
}));

describe('Auth Actions', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabaseClient();

    const { createClient, createActionClient } = require('../supabase/server');
    createClient.mockResolvedValue(mockSupabase);
    createActionClient.mockResolvedValue(mockSupabase);

    // Reset rate limit mock to default (allowed)
    const { checkRateLimit, formatRetryTime } = require('../rate-limit');
    checkRateLimit.mockResolvedValue({ allowed: true, remaining: 9 });
    formatRetryTime.mockResolvedValue('1 minute');
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        displayName: 'Test User',
      });

      expect(result.success).toBe(true);
      expect(result.redirectTo).toBe('/');
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            username: 'testuser',
            display_name: 'Test User',
          },
        },
      });
    });

    it('should reject sign up with missing required fields', async () => {
      const result = await signUp({
        email: '',
        password: 'password123',
        username: 'testuser',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email, password, and username are required');
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('should reject sign up with password less than 6 characters', async () => {
      const result = await signUp({
        email: 'test@example.com',
        password: '12345',
        username: 'testuser',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters');
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('should reject sign up with invalid username format', async () => {
      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        username: 'ab', // Too short
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Username must be 3-20 characters');
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('should reject sign up with special characters in username', async () => {
      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        username: 'test@user!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Username must be 3-20 characters');
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('should reject sign up with existing username', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { username: 'existinguser' },
              error: null
            })),
          })),
        })),
      });

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        username: 'existinguser',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('This username is already taken');
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('should handle Supabase auth errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      });

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });

    it('should handle unexpected errors gracefully', async () => {
      mockSupabase.auth.signUp.mockRejectedValue(new Error('Network error'));

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('An error occurred during sign up. Please try again.');
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123', user: mockUser };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.redirectTo).toBe('/');
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should reject sign in with missing email', async () => {
      const result = await signIn({
        email: '',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email and password are required');
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should reject sign in with missing password', async () => {
      const result = await signIn({
        email: 'test@example.com',
        password: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email and password are required');
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should handle invalid credentials error', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const result = await signIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should handle missing session after successful auth', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create session');
    });

    it('should handle unexpected errors gracefully', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));

      const result = await signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Sign in failed: Network error');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const result = await signOut();

      expect(result.success).toBe(true);
      expect(result.redirectTo).toBe('/');
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      mockSupabase.auth.signOut.mockRejectedValue(new Error('Sign out failed'));

      const result = await signOut();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to sign out');
    });
  });

  describe('updateProfile', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it('should successfully update profile', async () => {
      const updateData = {
        displayName: 'New Display Name',
        bio: 'New bio',
        location: 'New York',
      };

      const result = await updateProfile(updateData);

      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should reject profile update when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await updateProfile({ displayName: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('should enforce rate limiting on profile updates', async () => {
      const { checkRateLimit, formatRetryTime } = require('../rate-limit');
      checkRateLimit.mockResolvedValue({ allowed: false, retryAfter: 60 });
      formatRetryTime.mockResolvedValue('1 minute');

      const result = await updateProfile({ displayName: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('updating your profile too frequently');
      expect(result.error).toContain('1 minute');
    });

    it('should update only provided fields', async () => {
      let capturedUpdateData: Record<string, unknown> | null = null;

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            update: jest.fn((data: Record<string, unknown>) => {
              capturedUpdateData = data;
              return {
                eq: jest.fn(() => Promise.resolve({ error: null })),
              };
            }),
          };
        }
        return {};
      });

      const result = await updateProfile({
        displayName: 'New Name',
        // bio, location, signature not provided
      });

      expect(result.success).toBe(true);
      expect(capturedUpdateData).not.toBeNull();
      expect(capturedUpdateData?.display_name).toBe('New Name');
      expect(capturedUpdateData).toHaveProperty('updated_at');
    });

    it('should handle database errors', async () => {
      // First disable rate limiting for this test
      const { checkRateLimit } = require('../rate-limit');
      checkRateLimit.mockResolvedValue({ allowed: true, remaining: 9 });

      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            error: { message: 'Database error' }
          })),
        })),
      });

      const result = await updateProfile({ displayName: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update profile');
    });
  });

  describe('resetPassword', () => {
    it('should successfully send password reset email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      const result = await resetPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/reset-password'),
        })
      );
    });

    it('should handle password reset errors', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'User not found' },
      });

      const result = await resetPassword('nonexistent@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null });

      const result = await updatePassword('newpassword123');

      expect(result.success).toBe(true);
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
    });

    it('should handle password update errors', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        error: { message: 'Password too weak' },
      });

      const result = await updatePassword('weak');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password too weak');
    });
  });
});
