// Admin check types - separate file because 'use server' files can only export async functions

/**
 * Action result type for admin operations
 */
export interface AdminActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
