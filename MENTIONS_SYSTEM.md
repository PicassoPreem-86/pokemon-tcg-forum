# @Mention System Documentation

## Overview

The Pokemon TCG Forum now supports @mention functionality, allowing users to mention other users in threads and replies. When a user is mentioned, they receive a notification.

## Features

1. **Parse @mentions** - Automatically detects @username patterns in content
2. **Validate mentions** - Checks that mentioned users actually exist in the database
3. **Create notifications** - Sends notifications to mentioned users
4. **Clickable mentions** - @mentions render as links to user profiles
5. **Smart handling** - Excludes mentions in code blocks, prevents self-mentions

## How It Works

### 1. Content Parsing

The system uses a regular expression to extract @username patterns from content:

```typescript
/@(\w+)/g
```

This matches:
- `@john` → Extracts "john"
- `@jane_doe` → Extracts "jane_doe"
- `@user123` → Extracts "user123"

### 2. Validation

Before creating notifications, the system validates that mentioned users exist:

```typescript
const mentionedUsers = await extractAndValidateMentions(content);
```

This function:
1. Parses all @mentions from content
2. Queries the database to check which users exist
3. Returns only valid user profiles

### 3. Notification Creation

For each valid mentioned user, a notification is created with:
- **Type**: `'mention'`
- **Message**: `"{username} mentioned you in {context}"`
- **Link**: Link to the thread/reply where the mention occurred

### 4. Content Rendering

The RichContent component automatically converts @mentions to clickable links:

```typescript
<Link href={`/u/${username}`} className="content-mention">
  @{username}
</Link>
```

## Edge Cases Handled

### 1. Code Blocks
Mentions inside code blocks are NOT linkified or processed:

```
This is `@john` in code - NOT a mention
This is @jane outside code - IS a mention
```

### 2. Self-Mentions
Users cannot mention themselves - no notification is created:

```typescript
if (mentionedUser.id === user.id) {
  continue; // Skip self-mention
}
```

### 3. Duplicate Notifications
If a user is both the thread author AND mentioned, only ONE notification is sent:

```typescript
if (mentionedUser.id === threadWithAuthor.author_id) {
  continue; // Already notified as thread author
}
```

### 4. Case-Insensitive Matching
Mentions are case-insensitive - `@John`, `@john`, and `@JOHN` all refer to the same user.

### 5. Duplicate Mentions
Multiple mentions of the same user in one post only create ONE notification:

```typescript
const mentions = new Set<string>(); // Set automatically deduplicates
```

### 6. Usernames with Underscores
Usernames can contain underscores: `@john_doe` works correctly.

### 7. Maximum Mentions
Limited to 10 mentions per post to prevent abuse:

```typescript
const MAX_MENTIONS_PER_POST = 10;
```

## Usage Examples

### In a Thread
```
Hey @john, what do you think about this Charizard card?

I think @jane_smith had a similar one last week.
```

Result:
- `@john` receives notification: "username mentioned you in their thread 'Charizard Discussion'"
- `@jane_smith` receives notification: "username mentioned you in their thread 'Charizard Discussion'"

### In a Reply
```
@bob I agree with your analysis!
```

Result:
- `@bob` receives notification: "username mentioned you in 'Thread Title'"
- Thread author also receives separate "reply" notification (if different from @bob)

## Implementation Files

### Core Utilities
- **`/lib/mentions.ts`** - Mention parsing, validation, and linkification functions
  - `parseMentions(content)` - Extract @usernames from content
  - `validateMentions(usernames)` - Check which users exist
  - `linkifyMentions(content)` - Convert @mentions to HTML links
  - `extractAndValidateMentions(content)` - Combined parse + validate
  - `isUserMentioned(content, username)` - Check if specific user is mentioned

### Action Handlers
- **`/lib/actions/threads.ts`** - Thread creation with mention notifications
- **`/lib/actions/replies.ts`** - Reply creation with mention notifications

### Rendering
- **`/components/forum/RichContent.tsx`** - Renders mentions as clickable links
- **`/lib/content-renderer.ts`** - Parses inline @mention syntax

### Styling
- **`/app/globals.css`** - CSS for `.content-mention` class

## CSS Styling

Mentions are styled with a blue highlight:

```css
.rich-content .content-mention {
  color: #60A5FA;
  background: rgba(96, 165, 250, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.2s;
}

.rich-content .content-mention:hover {
  background: rgba(96, 165, 250, 0.2);
}
```

## Testing

Test cases cover:
- Single and multiple mentions
- Mentions with underscores
- Case-insensitive deduplication
- Code block exclusion
- Maximum mention limit
- Empty/invalid content handling
- Linkification correctness

Run tests with:
```bash
npm test lib/__tests__/mentions.test.ts
```

## Security Considerations

1. **Input Validation** - Only alphanumeric and underscore characters allowed
2. **Rate Limiting** - Max 10 mentions per post prevents spam
3. **Sanitization** - Content is sanitized before mention processing
4. **Database Queries** - Case-insensitive queries prevent username enumeration
5. **Self-Mention Prevention** - Users cannot spam themselves

## Performance

- **Database Queries**: Individual queries per username for accurate case-insensitive matching
- **Background Processing**: Notifications created asynchronously (non-blocking)
- **Caching**: Profile lookups could be cached in future optimization
- **Deduplication**: Set-based deduplication prevents redundant processing

## Future Enhancements

Potential improvements:
1. **Autocomplete** - Show username suggestions as user types @
2. **Mention Preview** - Hover over mention to see user profile card
3. **Batch Validation** - Optimize database queries for multiple mentions
4. **Notification Settings** - Allow users to disable mention notifications
5. **Mention Analytics** - Track mention frequency and engagement
