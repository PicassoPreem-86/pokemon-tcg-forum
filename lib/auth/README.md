# Admin Authentication Quick Reference

## Import Statement

```typescript
import { requireAdmin, withAdminAuth, isAdmin } from '@/lib/auth/admin-check';
```

## Quick Examples

### Protect a Server Component Page

```typescript
// app/admin/my-page/page.tsx
import { requireAdmin } from '@/lib/auth/admin-check';

export default async function MyAdminPage() {
  const admin = await requireAdmin('/admin/my-page');
  return <div>Welcome {admin.username}</div>;
}
```

### Protect a Server Action

```typescript
// lib/actions/my-admin-action.ts
'use server';

import { withAdminAuth } from '@/lib/auth/admin-check';

export async function myAction(data: any) {
  return withAdminAuth(async (admin) => {
    // Your code here
    return { success: true };
  });
}
```

### Check Admin Status Without Redirect

```typescript
import { checkAdminStatus } from '@/lib/auth/admin-check';

const { isAdmin, profile } = await checkAdminStatus();
if (isAdmin) {
  // Show admin content
}
```

### Require Specific Role Level

```typescript
import { requireRole } from '@/lib/auth/admin-check';

// Only admins, not moderators
const admin = await requireRole('admin');
```

## Function Reference

| Function | Use Case | Returns | Redirects |
|----------|----------|---------|-----------|
| `requireAdmin(path?)` | Server Components | `Profile` | Yes |
| `requireAdminOrThrow()` | API Routes | `Profile` | No (throws) |
| `requireRole(role)` | Permission levels | `Profile` | Yes |
| `checkAdminStatus()` | Conditional logic | `{isAdmin, profile}` | No |
| `isAdmin(userId)` | Check other users | `boolean` | No |
| `withAdminAuth(fn)` | Server Actions | `AdminActionResult` | No |

## Error Handling

```typescript
import { UnauthorizedError, ForbiddenError } from '@/lib/auth/admin-check';

try {
  await requireAdminOrThrow();
} catch (error) {
  if (error instanceof UnauthorizedError) {
    // Not logged in
  } else if (error instanceof ForbiddenError) {
    // Not an admin
  }
}
```

## Best Practices

1. Always use `requireAdmin()` in Server Components
2. Use `withAdminAuth()` wrapper for all server actions
3. Never expose sensitive data to client components
4. Log important admin actions with `logAdminAction()`
5. Check rate limits for destructive operations

## Common Patterns

### Admin-Only Route

```typescript
export default async function AdminRoute() {
  await requireAdmin();
  // Route content
}
```

### Conditional Admin Features

```typescript
const { isAdmin } = await checkAdminStatus();
return (
  <div>
    {isAdmin && <AdminTools />}
    <RegularContent />
  </div>
);
```

### Protected API Route

```typescript
export async function POST(request: Request) {
  try {
    const admin = await requireAdminOrThrow();
    // Handle request
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }
}
```

## Security Notes

- All functions verify role from database, not cookies
- User profiles are cached per request
- Rate limiting applied to destructive actions
- Audit logs created for important operations
- Self-protection prevents admins from modifying themselves

For complete documentation, see `/ADMIN_SECURITY.md`
