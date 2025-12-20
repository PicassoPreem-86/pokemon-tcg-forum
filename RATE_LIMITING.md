# Rate Limiting System Documentation

## Overview

The Pokemon TCG Forum implements a comprehensive rate limiting system to prevent spam, abuse, and ensure fair usage of the platform. This document describes the implementation, configuration, and usage of the rate limiting system.

## Architecture

### In-Memory Implementation (Default)

The default implementation uses an in-memory Map store, suitable for:
- Single-instance serverless deployments
- Development and testing environments
- Low to medium traffic applications

**Limitations:**
- Rate limits reset on serverless cold starts
- Not suitable for multi-instance deployments
- No persistence across restarts

### Database Implementation (Production)

For production environments with multiple instances, a PostgreSQL-based implementation is provided:
- Persistent rate limit tracking
- Works across multiple application instances
- Suitable for horizontal scaling
- Requires database cleanup via cron job

## Rate Limit Configurations

| Action | Limit | Window | Exempt Roles |
|--------|-------|--------|-------------|
| Thread Creation | 5 | 1 hour | Moderator, Admin |
| Reply Creation | 20 | 1 hour | Moderator, Admin |
| Like Actions | 100 | 1 hour | None |
| Profile Updates | 10 | 1 hour | Moderator, Admin |

## Implementation Files

### Core Files

1. **`/lib/rate-limit.ts`** - Main rate limiting utility
   - `checkRateLimit()` - Check and increment rate limit
   - `getRateLimitStatus()` - Get current status without incrementing
   - `formatRetryTime()` - Format retry time for user messages
   - `resetRateLimit()` - Admin function to reset limits

2. **`/supabase/migrations/add_rate_limiting.sql`** - Database schema
   - `rate_limits` table for persistent storage
   - RLS policies for security
   - Helper functions for database operations
   - Cleanup function for expired entries

3. **`/lib/supabase/database.types.ts`** - TypeScript types
   - `RateLimit` type definition
   - Database schema types

### Integration Points

Rate limiting is integrated into the following server actions:

1. **`/lib/actions/threads.ts`**
   - `createThread()` - Limited to 5 per hour

2. **`/lib/actions/replies.ts`**
   - `createReply()` - Limited to 20 per hour

3. **`/lib/actions/auth.ts`**
   - `updateProfile()` - Limited to 10 per hour

## Usage Examples

### Checking Rate Limits

```typescript
import { checkRateLimit, formatRetryTime } from '@/lib/rate-limit';

// In a server action
export async function createThread(data: CreateThreadData): Promise<ThreadResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check rate limit
  const rateLimitResult = await checkRateLimit(user.id, 'thread_create');

  if (!rateLimitResult.allowed) {
    const retryTime = formatRetryTime(rateLimitResult.retryAfter || 0);
    return {
      success: false,
      error: `You're creating threads too fast. Please wait ${retryTime} before trying again.`,
    };
  }

  // Proceed with thread creation...
}
```

### Getting Rate Limit Status

```typescript
import { getRateLimitStatus } from '@/lib/rate-limit';

// Get status without incrementing counter
const status = await getRateLimitStatus(userId, 'reply_create');

if (status.remaining <= 5) {
  // Show warning to user
  console.log(`Warning: Only ${status.remaining} replies remaining this hour`);
}
```

### Admin Reset

```typescript
import { resetRateLimit } from '@/lib/rate-limit';

// Reset a user's rate limit (admin only)
const success = await resetRateLimit(userId, 'thread_create');
```

## Database Setup

### Migration

Run the migration to create the rate_limits table:

```bash
# Using Supabase CLI
supabase db push

# Or manually execute the SQL file
psql -f supabase/migrations/add_rate_limiting.sql
```

### Periodic Cleanup

Set up a cron job to clean expired rate limit entries:

```sql
-- Create cron job (requires pg_cron extension)
SELECT cron.schedule(
  'cleanup-rate-limits',
  '0 * * * *', -- Every hour
  $$SELECT cleanup_expired_rate_limits()$$
);
```

Or use Supabase Edge Functions:

```typescript
// Edge Function: cleanup-rate-limits
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { error } = await supabase.rpc('cleanup_expired_rate_limits')

  return new Response(
    JSON.stringify({ success: !error }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

## Switching to Database Implementation

To use the persistent database implementation instead of in-memory:

1. Run the migration to create the `rate_limits` table
2. Update `checkRateLimit()` in `/lib/rate-limit.ts` to use database queries
3. Set up periodic cleanup via cron or Edge Functions

Example database implementation:

```typescript
export async function checkRateLimit(userId: string, action: string): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) {
    return { allowed: true };
  }

  const supabase = await createClient();

  // Check if user is exempt
  const userRole = await getUserRole(userId);
  if (isExemptRole(userRole, config)) {
    return { allowed: true, remaining: config.maxRequests };
  }

  // Use database function
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_user_id: userId,
    p_action: action,
    p_max_requests: config.maxRequests,
    p_window_ms: config.windowMs,
  });

  if (error || !data) {
    console.error('[Rate Limit] Database error:', error);
    return { allowed: true }; // Fail open
  }

  return {
    allowed: data.allowed,
    remaining: config.maxRequests - data.current_count,
    retryAfter: data.retry_after_seconds,
  };
}
```

## Error Messages

The system provides user-friendly error messages:

- **Thread Creation:** "You're creating threads too fast. Please wait X minutes before trying again."
- **Reply Creation:** "You're posting too fast. Please wait X minutes before trying again."
- **Profile Updates:** "You're updating your profile too frequently. Please wait X minutes before trying again."

Time formatting automatically adjusts:
- `< 60 seconds`: "X seconds"
- `< 60 minutes`: "X minutes"
- `>= 60 minutes`: "X hours"

## CSS Styling

Rate limit errors use consistent styling defined in `/app/globals.css`:

- `.rate-limit-error` - Error message display
- `.rate-limit-warning` - Warning when approaching limit
- `.rate-limit-status` - Status indicator component
- `.rate-limit-toast` - Toast notification style

## Security Considerations

### Role-Based Exemptions

- Moderators and Admins are exempt from most rate limits
- Like actions are rate limited for all users
- Exemptions are checked at the database level

### RLS Policies

The `rate_limits` table has Row Level Security enabled:
- Users can view their own rate limits
- Only service role can modify rate limits
- Admins can view all rate limits for moderation

### Fail-Open Strategy

If rate limiting fails (database error, missing config), the system allows the request:
- Prevents legitimate users from being blocked
- Logs errors for monitoring
- Better UX than false negatives

## Monitoring

### Key Metrics to Monitor

1. **Rate Limit Hits**: How often users hit rate limits
2. **Exemption Usage**: How often exemptions are used
3. **Database Performance**: Query performance on rate_limits table
4. **Memory Usage**: In-memory store size (if using in-memory)

### Logging

Rate limit events are logged:

```typescript
// In checkRateLimit()
if (!rateLimitResult.allowed) {
  console.log(`[Rate Limit] User ${userId} hit limit for ${action}`);
}
```

## Customization

### Adding New Rate Limits

1. Add configuration to `RATE_LIMIT_CONFIGS`:

```typescript
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // ... existing configs

  new_action: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 15,
    exemptRoles: ['moderator', 'admin'],
  },
};
```

2. Integrate into server action:

```typescript
const rateLimitResult = await checkRateLimit(user.id, 'new_action');
if (!rateLimitResult.allowed) {
  return { success: false, error: formatRateLimitError(rateLimitResult) };
}
```

### Adjusting Limits

Modify the `RATE_LIMIT_CONFIGS` object:

```typescript
thread_create: {
  windowMs: 60 * 60 * 1000, // Change window
  maxRequests: 10,          // Change limit
  exemptRoles: ['vip', 'moderator', 'admin'], // Add roles
},
```

## Production Recommendations

1. **Use Database Implementation**: For multi-instance deployments
2. **Set Up Cleanup Cron**: Run every hour to prevent table bloat
3. **Monitor Rate Limit Hits**: Alert on unusual patterns
4. **Adjust Limits Based on Usage**: Start conservative, adjust as needed
5. **Add Redis (Optional)**: For even better performance than database

### Redis Implementation Example

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function checkRateLimit(userId: string, action: string): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[action];
  const key = `rate_limit:${userId}:${action}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, config.windowMs / 1000);
  }

  if (count > config.maxRequests) {
    const ttl = await redis.ttl(key);
    return {
      allowed: false,
      retryAfter: ttl,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - count,
  };
}
```

## Troubleshooting

### Common Issues

1. **Rate limits resetting unexpectedly**
   - Solution: Use database implementation for persistence

2. **Users hitting limits too easily**
   - Solution: Increase maxRequests or windowMs

3. **Admin users being rate limited**
   - Solution: Check exemptRoles configuration

4. **Memory leaks in long-running processes**
   - Solution: Cleanup function runs periodically, or use database

### Debug Mode

Add logging to track rate limit behavior:

```typescript
const rateLimitResult = await checkRateLimit(user.id, action);
console.log('[Rate Limit Debug]', {
  userId: user.id,
  action,
  allowed: rateLimitResult.allowed,
  remaining: rateLimitResult.remaining,
  retryAfter: rateLimitResult.retryAfter,
});
```

## Future Enhancements

Potential improvements for the rate limiting system:

1. **Dynamic Rate Limits**: Adjust based on user reputation
2. **IP-Based Rate Limiting**: Prevent abuse from unauthenticated users
3. **Sliding Window**: More accurate than fixed window
4. **Rate Limit Analytics**: Dashboard showing usage patterns
5. **Burst Allowance**: Allow short bursts above the limit
6. **Custom Error Responses**: More detailed rate limit information in API responses

## License

This rate limiting implementation is part of the Pokemon TCG Forum project.
