'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export interface AuthResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

interface SignUpData {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

interface SignInData {
  email: string;
  password: string;
}

export async function signUp(data: SignUpData): Promise<AuthResult> {
  const supabase = await createClient();

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
}

export async function signIn(data: SignInData): Promise<AuthResult> {
  const supabase = await createClient();

  const { email, password } = data;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error);
    if (error.message.includes('Invalid login credentials')) {
      return { success: false, error: 'Invalid email or password' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true, redirectTo: '/' };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = await createClient();
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
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  location?: string;
  signature?: string;
  avatarUrl?: string;
}

export async function updateProfile(data: UpdateProfileData): Promise<AuthResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
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
