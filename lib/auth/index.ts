/**
 * Admin Authentication and Authorization
 * Export all admin security utilities
 */

// Server actions
export {
  requireAdmin,
  requireAdminOrThrow,
  requireRole,
  checkAdminStatus,
  isAdmin,
  getCurrentUserProfile,
  withAdminAuth,
  logAdminAction,
  type AdminActionResult,
} from './admin-check';

// Error classes
export { UnauthorizedError, ForbiddenError } from './errors';

// Utility functions
export { isAdminRole, checkRateLimit } from './utils';
