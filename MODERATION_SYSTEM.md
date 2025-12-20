# Pokemon TCG Forum - Moderation System Documentation

## Overview

This document describes the comprehensive moderation system implemented for the Pokemon TCG Forum. The system provides admins and moderators with powerful tools to manage users, content, and maintain community standards.

## Features

### User Moderation

#### 1. Ban User
- **Function**: `banUser(userId, reason, duration?)`
- **Description**: Ban a user permanently or temporarily
- **Parameters**:
  - `userId`: The ID of the user to ban
  - `reason`: Required reason for the ban (max 500 characters)
  - `duration`: Optional duration in days (null for permanent)
- **Security**:
  - Cannot ban yourself
  - Only admins can ban moderators
  - Cannot ban other admins
  - Rate limited to 5 bans per minute
- **Database Changes**:
  - Sets `is_banned = true`
  - Records `banned_at`, `banned_reason`, `banned_until`
- **Audit Trail**: Logged to `moderation_logs` table

#### 2. Unban User
- **Function**: `unbanUser(userId)`
- **Description**: Remove a ban from a user
- **Security**:
  - Verifies user is currently banned
  - Rate limited to 10 unbans per minute
- **Database Changes**:
  - Sets `is_banned = false`
  - Clears ban-related fields
- **Audit Trail**: Logged to `moderation_logs` table

#### 3. Suspend User
- **Function**: `suspendUser(userId, reason, days)`
- **Description**: Temporarily suspend a user (1-365 days)
- **Parameters**:
  - `userId`: The ID of the user to suspend
  - `reason`: Required reason for suspension
  - `days`: Duration in days (1-365)
- **Security**:
  - Cannot suspend yourself
  - Only admins can suspend moderators
  - Cannot suspend other admins
  - Rate limited to 10 suspensions per minute
- **Database Changes**:
  - Sets `is_suspended = true`
  - Records `suspended_at`, `suspended_reason`, `suspended_until`
- **Audit Trail**: Logged to `moderation_logs` table

#### 4. Unsuspend User
- **Function**: `unsuspendUser(userId)`
- **Description**: Remove a suspension from a user
- **Security**:
  - Verifies user is currently suspended
  - Rate limited to 10 unsuspensions per minute
- **Database Changes**:
  - Sets `is_suspended = false`
  - Clears suspension-related fields
- **Audit Trail**: Logged to `moderation_logs` table

### Content Moderation

#### 5. Delete Thread
- **Function**: `deleteThread(threadId, reason)`
- **Description**: Soft delete a thread (admin override)
- **Parameters**:
  - `threadId`: The ID of the thread to delete
  - `reason`: Required reason for deletion
- **Security**:
  - Rate limited to 20 deletions per minute
- **Database Changes**:
  - Sets `deleted_by`, `deleted_at`, `deleted_reason`
  - Thread remains in database but hidden from users
- **Audit Trail**: Logged to `moderation_logs` table

#### 6. Delete Reply
- **Function**: `deleteReply(replyId, reason)`
- **Description**: Soft delete a reply (admin override)
- **Parameters**:
  - `replyId`: The ID of the reply to delete
  - `reason`: Required reason for deletion
- **Security**:
  - Rate limited to 30 deletions per minute
- **Database Changes**:
  - Sets `deleted_by`, `deleted_at`, `deleted_reason`
  - Reply remains in database but hidden from users
- **Audit Trail**: Logged to `moderation_logs` table

#### 7. Lock/Unlock Thread
- **Function**: `lockThread(threadId)` / `unlockThread(threadId)`
- **Description**: Prevent or allow new replies to a thread
- **Security**:
  - Rate limited to 20 actions per minute
- **Database Changes**:
  - Toggles `is_locked` flag
- **Audit Trail**: Logged to `moderation_logs` table

#### 8. Pin/Unpin Thread
- **Function**: `pinThread(threadId)` / `unpinThread(threadId)`
- **Description**: Pin or unpin a thread to the top of category
- **Security**:
  - Rate limited to 20 actions per minute
- **Database Changes**:
  - Toggles `is_pinned` flag
- **Audit Trail**: Logged to `moderation_logs` table

## Database Schema

### New Tables

#### `moderation_logs`
Stores all moderation actions for audit trail.

```sql
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY,
  moderator_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(20) NOT NULL, -- 'user', 'thread', 'reply'
  target_id UUID NOT NULL,
  reason TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Updated Tables

#### `profiles` - New Ban/Suspension Fields
```sql
ALTER TABLE profiles ADD COLUMN:
  is_banned BOOLEAN DEFAULT FALSE,
  banned_at TIMESTAMP WITH TIME ZONE,
  banned_reason TEXT,
  banned_until TIMESTAMP WITH TIME ZONE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspended_at TIMESTAMP WITH TIME ZONE,
  suspended_reason TEXT,
  suspended_until TIMESTAMP WITH TIME ZONE
```

#### `threads` - New Deletion Fields
```sql
ALTER TABLE threads ADD COLUMN:
  deleted_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_reason TEXT
```

#### `replies` - New Deletion Fields
```sql
ALTER TABLE replies ADD COLUMN:
  deleted_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_reason TEXT
```

## Database Functions

### Auto-Expiration
A database function `expire_temporary_bans()` automatically removes expired bans and suspensions:

```sql
CREATE FUNCTION expire_temporary_bans() RETURNS void;
```

This should be run periodically (e.g., via cron job or manual execution).

### Ban/Suspension Checks
Helper functions to check user status:

```sql
CREATE FUNCTION is_user_banned(user_id UUID) RETURNS BOOLEAN;
CREATE FUNCTION is_user_suspended(user_id UUID) RETURNS BOOLEAN;
```

## API Usage

### Server Actions

All moderation functions are server actions and must be imported from:
- `/lib/actions/admin.ts` (main exports)
- `/lib/actions/admin-moderation.ts` (implementation)

Example usage in a client component:

```typescript
import { banUser, suspendUser } from '@/lib/actions/admin';

// Ban a user permanently
const result = await banUser(userId, 'Spam posting', undefined);

// Ban a user for 7 days
const result = await banUser(userId, 'Inappropriate language', 7);

// Suspend a user for 3 days
const result = await suspendUser(userId, 'Warning violation', 3);
```

### Moderation Logs

Query moderation logs:

```typescript
import {
  getModerationLogs,
  getTargetModerationHistory,
  getModeratorStats
} from '@/lib/actions/moderation-log';

// Get recent logs
const { logs, total } = await getModerationLogs({ limit: 50 });

// Get logs for specific user
const history = await getTargetModerationHistory(userId, 'user');

// Get moderator statistics
const stats = await getModeratorStats(moderatorId);
```

## Admin UI

### User Management (`/admin/users`)

The admin users page provides:
- Search and filter by role/status
- Role dropdown for quick role changes
- Action buttons:
  - **Edit**: Edit user details (placeholder)
  - **Suspend**: Suspend user with reason and duration
  - **Ban**: Ban user (permanent or temporary)
  - **Unban**: Remove ban from banned user
  - **Delete**: Delete user account

### Status Colors
- **Active**: Green
- **Banned**: Red
- **Suspended**: Orange
- **Pending**: Yellow

## Security Features

### Role Hierarchy
1. **Admin** - Full permissions
   - Can moderate all users including moderators
   - Can promote users to any role
   - Can perform hard deletes

2. **Moderator** - Limited permissions
   - Can moderate regular users (member, vip, newbie)
   - Cannot moderate other moderators or admins
   - Cannot promote to admin

### Rate Limiting
All moderation actions are rate-limited per moderator:
- Bans: 5 per minute
- Unbans/Suspensions: 10 per minute
- Thread deletions: 20 per minute
- Reply deletions: 30 per minute
- Lock/Pin actions: 20 per minute

### Audit Trail
All moderation actions are logged with:
- Moderator ID and username
- Action type
- Target type and ID
- Reason
- Additional details (JSON)
- IP address
- User agent
- Timestamp

### Self-Protection
- Users cannot ban/suspend/delete themselves
- Admins cannot be banned or suspended
- Moderators can only be moderated by admins

## Setup Instructions

### 1. Run Database Migration

```bash
# Apply the migration
supabase migration up

# Or manually run:
psql -d your_database -f supabase/migrations/add_moderation_system.sql
```

### 2. Setup Automatic Expiration (Optional)

If you have `pg_cron` extension enabled:

```sql
SELECT cron.schedule(
  'expire-bans',
  '*/5 * * * *',  -- Run every 5 minutes
  'SELECT expire_temporary_bans()'
);
```

Or create a scheduled task to run periodically:

```bash
# Add to crontab
*/5 * * * * psql -d your_database -c "SELECT expire_temporary_bans();"
```

### 3. Verify Setup

Check that tables exist:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('moderation_logs');
```

Check that columns exist:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('is_banned', 'is_suspended');
```

## Best Practices

### For Moderators

1. **Always provide clear reasons** - Help users understand why action was taken
2. **Use suspensions for first offenses** - Give users a chance to improve
3. **Document evidence** - Use the details field to record evidence
4. **Escalate when needed** - Contact admins for difficult cases
5. **Review logs regularly** - Check moderation history before taking action

### For Admins

1. **Monitor moderator activity** - Use `getModeratorStats()` to track actions
2. **Review appeals** - Check moderation logs for context
3. **Set clear guidelines** - Establish moderation policies
4. **Train moderators** - Ensure consistent application of rules
5. **Back up logs** - Export moderation_logs periodically

## Troubleshooting

### User still seeing content after ban
- Check if auto-expiration ran: `SELECT * FROM profiles WHERE is_banned = true AND banned_until < NOW()`
- Manually run: `SELECT expire_temporary_bans()`

### Cannot ban user
- Check role hierarchy (cannot ban admins)
- Check rate limit (wait 1 minute)
- Check if already banned

### Moderation logs not recording
- Check Supabase connection
- Verify moderation_logs table exists
- Check console for errors

## Future Enhancements

Potential improvements:
1. Reports system integration
2. Ban appeals workflow
3. Automated rule enforcement
4. IP-based banning
5. Warning system before bans
6. Moderation queue for flagged content
7. Statistics dashboard
8. Export moderation logs
9. Email notifications for moderation actions
10. Bulk moderation actions

## Support

For issues or questions:
1. Check this documentation
2. Review moderation logs for audit trail
3. Check Supabase logs for errors
4. Contact development team

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0
