# Admin Security Implementation

## Overview

This document describes the comprehensive server-side security implementation for the admin panel of the Pokemon TCG Forum. All admin routes are now protected with multiple layers of security.

## Security Architecture

### 1. Server-Side Route Protection

**Location**: `/app/admin/layout.tsx`

All admin routes are protected at the layout level using a Server Component that runs BEFORE any client code:

```typescript
export default async function AdminLayout({ children }) {
  // SERVER-SIDE CHECK - Runs before any client code
  const adminProfile = await requireAdmin('/admin');

  // Only authenticated admin/moderator users reach this point
  return <AdminLayoutClient adminProfile={adminProfile}>{children}</AdminLayoutClient>;
}
```

**Key Security Features**:
- Executes on the server before page render
- No client-side bypass possible
- Automatic redirect to login for unauthorized users
- Role verification from database (admin or moderator only)

### 2. Admin Authentication Utilities

**Location**: `/lib/auth/admin-check.ts`

Comprehensive authentication and authorization functions:

#### `requireAdmin(redirectTo?: string): Promise<Profile>`
- Primary authentication function for Server Components
- Verifies user is authenticated AND has admin/moderator role
- Automatically redirects unauthorized users to login
- Returns verified admin profile

#### `requireAdminOrThrow(): Promise<Profile>`
- Alternative for API routes and Server Actions
- Throws `UnauthorizedError` or `ForbiddenError` instead of redirecting
- Better for programmatic error handling

#### `isAdmin(userId: string): Promise<boolean>`
- Check if specific user has admin privileges
- Queries database for current role

#### `checkAdminStatus(): Promise<{isAdmin: boolean, profile: Profile | null}>`
- Non-throwing check for conditional logic
- Returns both auth status and profile

#### `requireRole(requiredRole: 'admin' | 'moderator'): Promise<Profile>`
- Fine-grained permission checking
- Only admins can perform admin-only actions
- Moderators have limited permissions

### 3. Server Actions Protection

**Location**: `/lib/actions/admin.ts`

All admin actions are protected with the `withAdminAuth` wrapper:

```typescript
export async function updateUserRole(userId: string, newRole: UserRole) {
  return withAdminAuth(async (adminProfile) => {
    // Action logic here - adminProfile is guaranteed to be admin/moderator
  });
}
```

**Security Features**:
- Automatic authentication check
- Role verification before action execution
- Audit logging for all actions
- Rate limiting to prevent abuse
- Permission level checking (admin vs moderator)

### 4. Built-in Security Protections

#### Rate Limiting
All destructive actions have rate limits:
- Role updates: 20 per minute
- User suspensions: 10 per minute
- User bans: 5 per minute
- User deletions: 5 per minute

#### Self-Protection
- Users cannot modify their own role
- Users cannot suspend/ban/delete themselves
- Prevents privilege escalation attacks

#### Hierarchy Protection
- Only admins can promote users to admin
- Only admins can ban moderators
- Admins cannot be banned or deleted
- Moderators cannot modify other moderators (unless you're admin)

#### Audit Logging
All admin actions are logged with:
- Admin user ID and username
- Action type and details
- Timestamp
- IP address (TODO: implement)
- User agent (TODO: implement)

## Available Admin Server Actions

### User Management

#### `getAdminStats(): Promise<AdminStats>`
Returns comprehensive dashboard statistics:
- Total users, posts, threads
- Active users today
- New users/posts/threads today
- Pending reports
- Banned users

#### `getAllUsers(filters): Promise<{users, total}>`
Fetch users with filtering and pagination:
```typescript
const result = await getAllUsers({
  search: 'username',
  role: 'member',
  limit: 50,
  offset: 0
});
```

#### `getUser(userId): Promise<AdminUser>`
Get detailed information for a single user.

#### `updateUserRole(userId, newRole): Promise<void>`
Change a user's role with security checks:
```typescript
await updateUserRole('user-id', 'moderator');
```

#### `suspendUser(userId, reason, duration?): Promise<void>`
Suspend a user temporarily:
```typescript
await suspendUser('user-id', 'Spam violation', 7 * 24 * 60 * 60 * 1000); // 7 days
```

#### `banUser(userId, reason): Promise<void>`
Permanently ban a user:
```typescript
await banUser('user-id', 'Multiple policy violations');
```

#### `deleteUser(userId, hardDelete): Promise<void>`
Delete a user (soft delete by default):
```typescript
await deleteUser('user-id', false); // Soft delete
await deleteUser('user-id', true);  // Hard delete (admin only)
```

#### `bulkUpdateUserRoles(userIds[], newRole): Promise<void>`
Update multiple users at once (max 50):
```typescript
await bulkUpdateUserRoles(['id1', 'id2', 'id3'], 'vip');
```

### Analytics & Reporting

#### `getRecentActivity(limit): Promise<ActivityItem[]>`
Get recent forum activity for dashboard.

#### `getTopContributors(limit): Promise<TopContributor[]>`
Get users with highest post counts and reputation.

#### `searchUsers(query, limit): Promise<AdminUser[]>`
Search for users by username or display name.

## Usage Examples

### Protecting a Server Component Page

```typescript
// app/admin/some-page/page.tsx
import { requireAdmin } from '@/lib/auth/admin-check';

export default async function AdminPage() {
  // This runs on the server
  const adminProfile = await requireAdmin('/admin/some-page');

  // Only admins/moderators can reach this code
  return <div>Admin Content</div>;
}
```

### Creating a Protected Server Action

```typescript
// lib/actions/custom-admin.ts
'use server';

import { withAdminAuth, logAdminAction } from '@/lib/auth/admin-check';

export async function customAdminAction(data: any) {
  return withAdminAuth(async (adminProfile) => {
    // Perform action with guaranteed admin access

    // Log the action
    await logAdminAction('custom_action', { data }, adminProfile);

    return { success: true };
  });
}
```

### Fine-Grained Permission Control

```typescript
import { requireRole } from '@/lib/auth/admin-check';

export async function adminOnlyAction() {
  // Only allows users with 'admin' role
  const adminProfile = await requireRole('admin');

  // Moderators will be denied
  // Perform admin-only operation
}
```

### Using in Client Components

```typescript
'use client';

import { updateUserRole } from '@/lib/actions/admin';

export function UserRoleSelector({ userId }) {
  const handleRoleChange = async (newRole) => {
    const result = await updateUserRole(userId, newRole);

    if (result.success) {
      alert('Role updated!');
    } else {
      alert(result.error);
    }
  };

  return <select onChange={(e) => handleRoleChange(e.target.value)}>...</select>;
}
```

## Security Best Practices

### 1. Always Use Server-Side Checks
- Never rely on client-side role checks alone
- Client code can be bypassed
- Server checks are the source of truth

### 2. Validate All Inputs
- All server actions validate user inputs
- Prevent SQL injection with parameterized queries
- Sanitize data before database operations

### 3. Use Transactions for Critical Operations
- Ensure data consistency
- Rollback on errors
- Prevent partial updates

### 4. Implement Audit Logging
- Log all administrative actions
- Track who did what and when
- Essential for security investigations

### 5. Rate Limiting
- Prevent abuse even by legitimate admins
- Configurable per action type
- Automatic throttling

### 6. Error Handling
- Don't expose sensitive information in errors
- Log detailed errors server-side
- Return generic errors to client

## Future Enhancements

### Recommended Additions

1. **Audit Log Table**
   - Create `admin_audit_log` table in Supabase
   - Store IP addresses, user agents
   - Searchable audit trail

2. **Two-Factor Authentication**
   - Require 2FA for admin accounts
   - TOTP-based authentication
   - Backup codes

3. **Session Management**
   - Track active admin sessions
   - Force logout capability
   - Session timeout configuration

4. **IP Whitelisting**
   - Allow admin access only from specific IPs
   - Configurable per admin user
   - Emergency override procedure

5. **Webhook Notifications**
   - Alert on suspicious admin activity
   - Notify on permission changes
   - Integration with Slack/Discord

6. **Ban Status Field**
   - Add `banned_at`, `banned_by`, `ban_reason` to profiles
   - Track suspension history
   - Automatic unban scheduling

7. **Action Approval System**
   - Require approval for critical actions
   - Multi-admin verification
   - Prevent rogue admin attacks

## Compliance Considerations

### GDPR
- User deletion includes all personal data
- Audit logs comply with data retention policies
- Users can request their admin action history

### Security Standards
- Follows OWASP Top 10 best practices
- Implements principle of least privilege
- Defense in depth architecture

## Testing

### Manual Testing Checklist

- [ ] Non-authenticated users redirected from /admin
- [ ] Regular users (member/vip) denied admin access
- [ ] Moderators can access admin panel
- [ ] Admins can access admin panel
- [ ] Cannot modify own role
- [ ] Cannot suspend/ban self
- [ ] Rate limiting works (test rapid actions)
- [ ] Moderators cannot ban other moderators
- [ ] Only admins can promote to admin
- [ ] Admins cannot be banned
- [ ] All actions logged correctly
- [ ] Search and filtering work
- [ ] Bulk actions respect permissions

### Automated Testing (TODO)

Create tests for:
- Authentication middleware
- Authorization checks
- Server actions
- Rate limiting
- Audit logging

## Support

For security issues or questions:
- Review this documentation
- Check server logs for errors
- Verify user roles in database
- Test with different user levels

## Version History

- **v1.0** (2024-12-19): Initial implementation
  - Server-side route protection
  - Admin authentication utilities
  - Protected server actions
  - Rate limiting
  - Audit logging framework
  - Real data integration
