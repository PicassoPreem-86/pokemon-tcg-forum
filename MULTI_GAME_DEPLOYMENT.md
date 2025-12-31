# 🏴‍☠️ Multi-Game Forum Deployment Guide

## Overview
Your TCG Gossip forum now supports **both Pokemon TCG and One Piece TCG**! This guide will help you deploy the multi-game features.

---

## Step 1: Run Database Migrations ✅ REQUIRED

### A. Add Multi-Game Support (5 min)

**File**: `ADD_MULTI_GAME_SUPPORT.sql` ← Already copied to your clipboard!

1. **Supabase SQL Editor is open** in your browser
2. **Paste the SQL** (Cmd+V)
3. **Click "Run"**

This will:
- Add `game` column to categories table
- Update existing Pokemon categories
- Create 7 new One Piece TCG categories

**Expected Output**:
```
✅ ALTER TABLE successful
✅ 7 One Piece categories created
✅ Verification shows Pokemon (7) + One Piece (7) = 14 categories
```

---

### B. Add One Piece Seed Data (5 min)

**After Step A completes:**

1. Copy One Piece seed data:
```bash
cat ONE_PIECE_SEED_DATA.sql | pbcopy
```

2. **Paste in Supabase SQL Editor** (Cmd+V)
3. **Click "Run"**

This will create:
- 7 realistic One Piece TCG threads
- Tags and replies
- Engagement stats

**Expected Output**:
```
✅ 7 threads created
✅ Tags added
✅ Replies added
✅ Verification shows engagement stats
```

---

## Step 2: Verify Changes (2 min)

Run this query in Supabase to verify everything worked:

```sql
-- Check categories by game
SELECT game, COUNT(*) as count, string_agg(name, ', ') as categories
FROM categories
GROUP BY game;

-- Check One Piece threads
SELECT title, view_count, post_count
FROM threads t
JOIN categories c ON t.category_id = c.id
WHERE c.game = 'onepiece';
```

**Expected Results**:
- Pokemon: 7 categories
- One Piece: 7 categories
- 7 One Piece threads with realistic engagement

---

## Step 3: Test Locally (Optional, 3 min)

```bash
npm run dev
```

Visit: http://localhost:3000

**What to Look For**:
- ✅ Pokemon categories still work
- ✅ One Piece categories appear
- ✅ Game filter shows (All Games / Pokemon / One Piece)
- ✅ Threads display under correct game

---

## Step 4: Deploy to Production (2 min)

```bash
git add .
git commit -m "Add One Piece TCG multi-game support

- Add game column to categories table
- Create One Piece TCG categories (7 total)
- Add 7 One Piece seed threads with tags/replies
- Implement game filter UI component
- Add game configuration to lib/config.ts
- Group categories by game on homepage"

git push origin main
```

**Vercel will automatically deploy** within 30-60 seconds.

---

## What's New

### Database
- `categories.game` column (`pokemon` or `onepiece`)
- 7 new One Piece categories
- 7 One Piece threads with realistic content

### UI Components
- `GameFilter.tsx` - Game selector tabs
- Game-grouped categories on homepage
- Game badge on category pages
- Multi-game CSS styles

### Configuration
- `SUPPORTED_GAMES` - Game definitions
- `getCategoriesByGame()` - Filter categories
- `getCategoriesGroupedByGame()` - Group for homepage

---

## Post-Deployment Checklist

After deploying, verify on production:

1. **Homepage**:
   - [ ] Game filter tabs visible
   - [ ] Pokemon section with 7 categories
   - [ ] One Piece section with 7 categories

2. **Categories**:
   - [ ] `/c/general` (Pokemon) works
   - [ ] `/c/op-general` (One Piece) works
   - [ ] Threads display correctly

3. **Game Filter**:
   - [ ] "All Games" shows all threads
   - [ ] "Pokemon" filters Pokemon only
   - [ ] "One Piece" filters One Piece only

4. **Threads**:
   - [ ] One Piece threads have realistic content
   - [ ] Tags work correctly
   - [ ] Replies display

---

## Troubleshooting

### Categories not showing up?
```sql
-- Check if categories were created
SELECT slug, name, game FROM categories ORDER BY game, sort_order;
```

### Game filter not working?
- Clear browser cache (Cmd+Shift+R)
- Check console for errors
- Verify `lib/config.ts` was deployed

### Threads not showing?
```sql
-- Check One Piece threads
SELECT COUNT(*) FROM threads t
JOIN categories c ON t.category_id = c.id
WHERE c.game = 'onepiece';
```

---

## Future Expansion

Adding more games is now trivial:

```typescript
// lib/config.ts
yugioh: {
  name: 'Yu-Gi-Oh! TCG',
  shortName: 'Yu-Gi-Oh',
  icon: '⚡',
  color: '#9333EA',
  slug: 'yugioh',
  description: 'It\'s time to duel!'
}
```

Then just add categories with `game = 'yugioh'` in Supabase!

---

## Support

If you encounter issues:
1. Check Supabase logs
2. Check Vercel deployment logs
3. Test locally first
4. Verify SQL ran successfully

**Your forum now supports multiple TCG games!** 🎴🏴‍☠️⚡
