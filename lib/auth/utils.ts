/**
 * Utility functions for admin authentication
 * Non-async helper functions in a separate file
 */

import type { UserRole } from '@/lib/supabase/database.types';

/**
 * Admin role types
 */
const ADMIN_ROLES: UserRole[] = ['admin', 'moderator'];

/**
 * Check if a role has admin privileges
 */
export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Rate limiting helper for admin actions
 * Prevents abuse even by admin accounts
 */
const actionTimestamps = new Map<string, number[]>();

export function checkRateLimit(
  actionKey: string,
  maxActions: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const timestamps = actionTimestamps.get(actionKey) || [];

  // Remove timestamps outside the window
  const validTimestamps = timestamps.filter(t => now - t < windowMs);

  if (validTimestamps.length >= maxActions) {
    return false; // Rate limit exceeded
  }

  // Add current timestamp
  validTimestamps.push(now);
  actionTimestamps.set(actionKey, validTimestamps);

  return true;
}
