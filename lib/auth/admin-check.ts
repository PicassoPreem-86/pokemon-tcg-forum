'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Profile, UserRole } from '@/lib/supabase/database.types';
import { UnauthorizedError, ForbiddenError } from './errors';
import { isAdminRole } from './utils';
// Import types from separate file (Next.js 15/16 'use server' files can only export async functions)
import type { AdminActionResult } from './admin-check-types';

// Re-export type for consumers
export type { AdminActionResult } from './admin-check-types';

// Helper type for role query result
type RoleQueryResult = { role: UserRole };

/**
 * Get the current authenticated user's profile
 * Note: Removed React cache() wrapper as 'use server' files can only export async functions
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return null;
    }

    if (!user) {
      return null;
    }

    // Get user profile with role information
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
}

/**
 * Check if a user ID has admin privileges
 * @param userId - The user ID to check
 * @returns Promise<boolean>
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type inference issue
    const { data: profile, error } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single() as { data: RoleQueryResult | null; error: unknown };

    if (error || !profile) {
      return false;
    }

    return isAdminRole(profile.role);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Require admin authentication - returns user profile or redirects to login
 * Use this in Server Components and Server Actions that require admin access
 * @param redirectTo - Optional path to redirect back to after login
 * @returns Promise<Profile> - The authenticated admin user's profile
 * @throws Redirects to login if not authenticated or not an admin
 */
export async function requireAdmin(redirectTo?: string): Promise<Profile> {
  const profile = await getCurrentUserProfile();

  // Not authenticated - redirect to login
  if (!profile) {
    const loginUrl = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}&error=auth_required`
      : '/login?error=auth_required';
    redirect(loginUrl);
  }

  // Not an admin - redirect to login with error
  if (!isAdminRole(profile.role)) {
    const loginUrl = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}&error=unauthorized`
      : '/login?error=unauthorized';
    redirect(loginUrl);
  }

  return profile;
}

/**
 * Require admin authentication without redirect - throws error instead
 * Use this in API routes and Server Actions where you want to handle errors
 * @returns Promise<Profile> - The authenticated admin user's profile
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if authenticated but not an admin
 */
export async function requireAdminOrThrow(): Promise<Profile> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!isAdminRole(profile.role)) {
    throw new ForbiddenError('Admin or moderator access required');
  }

  return profile;
}

/**
 * Check if current user is admin without throwing or redirecting
 * @returns Promise<{isAdmin: boolean, profile: Profile | null}>
 */
export async function checkAdminStatus(): Promise<{
  isAdmin: boolean;
  profile: Profile | null;
}> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return { isAdmin: false, profile: null };
  }

  return {
    isAdmin: isAdminRole(profile.role),
    profile,
  };
}

/**
 * Verify admin role for specific permission level
 * @param requiredRole - The minimum role required ('admin' or 'moderator')
 * @returns Promise<Profile> - The authenticated user's profile
 * @throws Redirects if insufficient permissions
 */
export async function requireRole(requiredRole: 'admin' | 'moderator'): Promise<Profile> {
  const profile = await requireAdmin();

  // If admin is required and user is only moderator, deny access
  if (requiredRole === 'admin' && profile.role !== 'admin') {
    redirect('/admin?error=insufficient_permissions');
  }

  return profile;
}

/**
 * Wrap an admin action with automatic permission checking
 * @param action - The async function to execute with admin privileges
 * @returns Promise<AdminActionResult<T>>
 */
export async function withAdminAuth<T>(
  action: (profile: Profile) => Promise<T>
): Promise<AdminActionResult<T>> {
  try {
    const profile = await requireAdminOrThrow();
    const data = await action(profile);
    return { success: true, data };
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return { success: false, error: error.message };
    }
    console.error('Admin action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    };
  }
}

/**
 * Audit log helper for admin actions
 * Logs important admin actions for security monitoring
 */
export async function logAdminAction(
  action: string,
  details: Record<string, unknown>,
  adminProfile: Profile
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Reserved for future database audit logging
    const _supabase = await createClient();

    // You can expand this to log to a dedicated audit table
    console.log('[ADMIN ACTION]', {
      timestamp: new Date().toISOString(),
      admin_id: adminProfile.id,
      admin_username: adminProfile.username,
      action,
      details,
    });

    // TODO: Implement database audit logging
    // await supabase.from('admin_audit_log').insert({
    //   admin_id: adminProfile.id,
    //   action,
    //   details,
    //   ip_address: headers().get('x-forwarded-for'),
    //   user_agent: headers().get('user-agent'),
    // });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
