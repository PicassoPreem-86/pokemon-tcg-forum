'use server';

import { createClient, createActionClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { checkRateLimit, formatRetryTime } from '@/lib/rate-limit';
import type { AuthResult, SignUpData, SignInData, UpdateProfileData } from './types';

export async function signUp(data: SignUpData): Promise<AuthResult> {
  try {
    const supabase = await createActionClient();

    const { email, password, username, displayName } = data;

    // Validate inputs
    if (!email || !password || !username) {
      return { success: false, error: 'Email, password, and username are required' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return {
        success: false,
        error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
      };
    }

    // Check if username is taken
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return { success: false, error: 'This username is already taken' };
    }

    // Sign up the user
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName || username,
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create account' };
    }

    revalidatePath('/', 'layout');
    return { success: true, redirectTo: '/' };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'An error occurred during sign up. Please try again.' };
  }
}

export async function signIn(data: SignInData): Promise<AuthResult> {
  // Debug: Log that we reached the server action
  console.log('signIn called with email:', data.email);

  try {
    const { email, password } = data;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Use createActionClient for Server Actions - it properly sets cookies
    console.log('Creating Supabase action client...');
    const supabase = await createActionClient();
    console.log('Supabase action client created successfully');

    console.log('Attempting sign in...');
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('Sign in attempt completed, error:', error?.message || 'none');
    console.log('Sign in session:', authData?.session ? 'exists' : 'none');

    if (error) {
      console.error('Login error:', error);
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Invalid email or password' };
      }
      return { success: false, error: error.message };
    }

    console.log('Sign in successful, revalidating path...');
    revalidatePath('/', 'layout');
    return { success: true, redirectTo: '/' };
  } catch (error) {
    console.error('Sign in error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Sign in failed: ${errorMessage}` };
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const supabase = await createActionClient();
    const headersList = await headers();
    const origin = headersList.get('origin') || 'http://localhost:3000';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }

    if (data.url) {
      redirect(data.url);
    }

    return { success: true };
  } catch (error) {
    // Re-throw redirect errors (they're not actual errors)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Google sign in error:', error);
    return { success: false, error: 'An error occurred during Google sign in. Please try again.' };
  }
}

export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = await createActionClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    return { success: true, redirectTo: '/' };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'Failed to sign out' };
  }
}

export async function updateProfile(data: UpdateProfileData): Promise<AuthResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // SECURITY: Check rate limit for profile updates
  const rateLimitResult = await checkRateLimit(user.id, 'profile_update');
  if (!rateLimitResult.allowed) {
    const retryTime = await formatRetryTime(rateLimitResult.retryAfter || 0);
    return {
      success: false,
      error: `You're updating your profile too frequently. Please wait ${retryTime} before trying again.`,
    };
  }

  // Build update object with only defined values
  const updateData: Record<string, string | null | undefined> = {
    updated_at: new Date().toISOString(),
  };

  if (data.displayName !== undefined) updateData.display_name = data.displayName;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.signature !== undefined) updateData.signature = data.signature;
  if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (error) {
    console.error('Profile update error:', error);
    return { success: false, error: 'Failed to update profile' };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, badges:user_badges(*)')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get('origin') || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    console.error('Password reset error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('Password update error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
