# Mock Data Removal & Category Update Plan

**Date:** December 30, 2025
**Status:** Ready for Implementation

---

## 🎯 Overview

This document outlines the complete plan to:
1. Remove all mock data from the production site
2. Replace mock data with real Supabase database queries
3. Update categories based on competitor analysis

---

## 📊 Mock Data Audit

### Files Containing Mock Data:

#### 1. **lib/mock-data/** directory
- ✅ `threads.ts` - 15 mock threads with detailed metadata
- ✅ `users.ts` - 10 mock users with profiles and badges
- ✅ `stats.ts` - Forum statistics (members, posts, threads)
- ✅ `posts.ts` - Mock post data (identified in grep)

#### 2. **lib/categories.ts**
- ✅ `LATEST_THREADS` - 8 mock threads
- ✅ `FORUM_STATS` - Mock forum statistics
- ✅ `ONLINE_USERS` - 8 mock usernames

#### 3. **Pages Using Mock Data:**
- ✅ `app/page.tsx` - Homepage (LATEST_THREADS, FORUM_STATS, ONLINE_USERS, getPopularTags)
- ✅ `app/search/page.tsx` - Search (MOCK_THREADS, MOCK_USERS)
- ✅ `app/hot/page.tsx` - Hot threads (getTrendingThreads, getRisingThreads)
- ✅ `app/members/page.tsx` - Members list (MOCK_USERS)
- ✅ `app/cards/page.tsx` - Cards page
- ✅ `app/t/[id]/page.tsx` - Thread view
- ✅ `app/c/[slug]/page.tsx` - Category view
- ✅ `app/tag/[tag]/page.tsx` - Tag view (getThreadsByTag)
- ✅ `app/(forum)/trading/page.tsx` - Trading category
- ✅ `app/new/page.tsx` - New thread (mock tags)
- ✅ `app/sitemap.ts` - Sitemap generation
- ✅ `components/widgets/PopularTagsWidget.tsx`
- ✅ `components/UserHoverCard.tsx`

---

## 🗄️ Database Schema Status

Current tables (from RUN_THIS_IN_SUPABASE.sql):
- ✅ `profiles` - User profiles
- ✅ `categories` - Forum categories
- ✅ `threads` - Discussion threads
- ✅ `thread_tags` - Thread tagging
- ✅ `replies` - Thread replies
- ✅ `reply_images` - Reply attachments
- ✅ `user_badges` - User achievements
- ✅ `thread_likes` - Thread likes
- ✅ `reply_likes` - Reply likes

**Seeded Categories (Current 7):**
1. General Discussion
2. Collecting
3. Market & Prices
4. Grading
5. Articles & Guides
6. News
7. Buy & Trade

---

## 🔄 Category Updates (Based on Competitor Analysis)

### Tier 1 - Essential Categories (Must Add):

**NEW: Competitive Play** ⚠️ CRITICAL MISSING
- Deck Building & Strategy
- Tournament Reports
- Meta Discussion
- Card Rulings & Questions

**NEW: TCG Pocket** ⚠️ HOT TOPIC 2025
- General Discussion
- Strategy & Deck Building
- F2P Guides
- Physical vs Digital

**NEW: Pulls & Collections** ⚠️ HIGH ENGAGEMENT
- Pull Posts & Brag Posts
- Collection Showcases
- Set Completion
- Mail Day

**NEW: Authentication** ⚠️ IMPORTANT
- Fake Card Help
- Verification Requests
- Red Flags Guide
- Legit Checks

### Updated Categories List (14 total):

1. **General Discussion** (keep as-is)
2. **Competitive Play** (NEW)
3. **TCG Pocket** (NEW)
4. **Collecting** (keep as-is)
5. **Pulls & Showcases** (NEW - high engagement)
6. **Market & Prices** (keep as-is)
7. **Grading** (keep as-is)
8. **Authentication** (NEW - critical)
9. **Articles & Guides** (keep as-is)
10. **News** (keep as-is)
11. **Buy & Trade** (keep as-is)
12. **Beginner Zone** (NEW - recommended)
13. **Investment & Finance** (NEW - recommended)
14. **Local & Events** (NEW - future)

---

## 🚀 Implementation Plan

### Phase 1: Create Real Data Queries ✅

#### Step 1.1: Create Database Query Helpers
Create `/lib/db/queries.ts` with functions:

```typescript
// Thread queries
export async function getLatestThreads(limit = 10)
export async function getHotThreads(limit = 10)
export async function getThreadsByCategory(categoryId: string)
export async function getThreadById(id: string)
export async function getThreadBySlug(slug: string)
export async function searchThreads(query: string)

// User queries
export async function getOnlineUsers(limit = 20)
export async function searchUsers(query: string)
export async function getUserByUsername(username: string)

// Stats queries
export async function getForumStats()

// Tag queries
export async function getPopularTags(limit = 20)
export async function getThreadsByTag(tag: string)
```

#### Step 1.2: Create Stat Aggregation Functions
- Count total threads from database
- Count total users from profiles
- Count total posts (threads + replies)
- Detect online users (last_seen within 15 minutes)

### Phase 2: Update Categories in Database ✅

Run SQL migration to add new categories:

```sql
-- Add Competitive Play
INSERT INTO categories (slug, name, description, icon, color, sort_order)
VALUES ('competitive', 'Competitive Play', 'Deck building, tournaments, and meta discussion', 'Sword', '#3B82F6', 2);

-- Add TCG Pocket
INSERT INTO categories (slug, name, description, icon, color, sort_order)
VALUES ('tcg-pocket', 'TCG Pocket', 'Pokemon TCG Pocket mobile game discussion', 'Smartphone', '#10B981', 3);

-- Add Pulls & Showcases
INSERT INTO categories (slug, name, description, icon, color, sort_order)
VALUES ('pulls', 'Pulls & Showcases', 'Show off your amazing pulls and collections', 'Sparkles', '#F59E0B', 4);

-- Add Authentication
INSERT INTO categories (slug, name, description, icon, color, sort_order)
VALUES ('authentication', 'Authentication', 'Fake card identification and authentication help', 'Shield', '#EF4444', 8);

-- Update sort_order for existing categories
-- (See full SQL in implementation)
```

### Phase 3: Replace Mock Data with Real Queries ✅

#### Pages to Update:
1. **app/page.tsx**
   - Replace `LATEST_THREADS` with `getLatestThreads()`
   - Replace `FORUM_STATS` with `getForumStats()`
   - Replace `ONLINE_USERS` with `getOnlineUsers()`
   - Replace `getPopularTags()` with DB query

2. **app/search/page.tsx**
   - Replace `MOCK_THREADS` with `searchThreads(query)`
   - Replace `MOCK_USERS` with `searchUsers(query)`

3. **app/hot/page.tsx**
   - Replace trending algorithm with real data
   - Calculate trending scores from actual thread metrics

4. **app/members/page.tsx**
   - Replace `MOCK_USERS` with real user query

5. **app/c/[slug]/page.tsx**
   - Replace `getThreadsByCategory()` with DB query

6. **app/tag/[tag]/page.tsx**
   - Replace `getThreadsByTag()` with DB query

7. **app/sitemap.ts**
   - Replace mock data with real threads/users

#### Components to Update:
1. **components/widgets/PopularTagsWidget.tsx**
   - Replace `getPopularTags()` with DB query

2. **lib/categories.ts**
   - Remove `LATEST_THREADS`
   - Remove `FORUM_STATS`
   - Remove `ONLINE_USERS`
   - Keep only category definitions

### Phase 4: Remove Mock Data Files ✅

#### Archive Mock Data (Don't Delete - Keep for Tests)
Move to `lib/__mocks__/` directory:
- `lib/mock-data/threads.ts` → `lib/__mocks__/threads.ts`
- `lib/mock-data/users.ts` → `lib/__mocks__/users.ts`
- `lib/mock-data/stats.ts` → `lib/__mocks__/stats.ts`
- `lib/mock-data/posts.ts` → `lib/__mocks__/posts.ts`

#### Update Test Files
Update any test imports to use `__mocks__` directory

---

## ✅ Acceptance Criteria

### Mock Data Removal:
- [ ] No imports from `lib/mock-data/*` in production code
- [ ] All pages fetch real data from Supabase
- [ ] Homepage shows real threads and stats
- [ ] Search works with real database queries
- [ ] All category pages show real threads

### Category Updates:
- [ ] 14 categories visible in database
- [ ] New categories: Competitive Play, TCG Pocket, Pulls & Showcases, Authentication
- [ ] All categories have proper icons and colors
- [ ] Sort order displays correctly
- [ ] Users can create threads in new categories

### Performance:
- [ ] Page load times < 500ms
- [ ] Database queries optimized with indexes
- [ ] No N+1 query issues
- [ ] Proper error handling for empty states

---

## 🎯 Priority Order

### IMMEDIATE (Today):
1. ✅ Create database query helpers (`lib/db/queries.ts`)
2. ✅ Run category update SQL migration
3. ✅ Update homepage (`app/page.tsx`) to use real data
4. ✅ Update search page (`app/search/page.tsx`)

### SHORT-TERM (This Week):
5. ✅ Update all remaining pages
6. ✅ Update components
7. ✅ Move mock files to `__mocks__/`
8. ✅ Update test files
9. ✅ Test all pages thoroughly

### TESTING:
- [ ] Create real test threads in each category
- [ ] Verify stats calculations are accurate
- [ ] Test search functionality
- [ ] Verify trending algorithm works with real data
- [ ] Check all links and navigation

---

## 🚨 Risks & Mitigation

### Risk 1: Empty Database = Empty Pages
**Mitigation:**
- Add graceful empty states
- Seed database with initial welcome threads
- Show helpful "Get Started" messages

### Risk 2: Performance Issues with Real Queries
**Mitigation:**
- Use database indexes (already created)
- Implement pagination (limit queries)
- Add caching where appropriate
- Monitor query performance

### Risk 3: Breaking Existing Features
**Mitigation:**
- Test thoroughly before deploying
- Keep mock data in `__mocks__/` for rollback
- Deploy during low-traffic period
- Monitor error logs after deployment

---

## 📝 Success Metrics

**Post-Implementation:**
- 100% real data (no mock imports in production)
- All 14 categories visible and functional
- Page load times < 500ms
- Zero errors in production logs
- Users can create threads in new categories
- Search returns real results

---

**Implementation Status:** READY TO BEGIN
**Estimated Time:** 2-3 hours
**Risk Level:** LOW (Good planning, existing tests, rollback available)
