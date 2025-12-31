# 🌱 Seed Data - Quick Start Guide

## What You're Getting

This seed data creates a realistic, active-looking Pokemon TCG forum with:

✅ **10 community members** + your admin account
- Mix of veterans, newbies, competitive players, collectors
- Realistic usernames and bios
- Varied reputation levels

✅ **15 high-quality discussion threads** across all categories:
- Competitive meta discussions
- TCG Pocket guides
- Pull showcases
- Authentication help
- Beginner guides
- Market analysis
- General discussions

✅ **10+ realistic replies** to make threads look active

✅ **Popular tags** (competitive, tcg-pocket, guide, authentication, etc.)

---

## 🚀 How to Run (7 Minutes)

### Step 1: Create Your Admin Account FIRST
**IMPORTANT:** You must create your admin account before running the seed data!

**Option A - Create through Supabase Dashboard:**
1. Go to https://supabase.com/dashboard/project/vzgefgghnoqaqqjrthmw/auth/users
2. Click "Add User" → "Create new user"
3. Email: `admin@tcggossip.com`
4. Password: `ChangeThisPassword123!` (you'll change this later)
5. Check "Auto Confirm User"
6. Click "Create User"

**Option B - Sign up through your site:**
1. Go to https://www.tcggossip.com (or your deployment URL)
2. Click "Sign Up"
3. Email: `admin@tcggossip.com`
4. Password: `ChangeThisPassword123!`
5. Verify email if prompted

### Step 2: Open Supabase SQL Editor
https://supabase.com/dashboard/project/vzgefgghnoqaqqjrthmw/sql/new

### Step 3: Run the Seed Data
1. Open `SEED_DATA.sql` in this directory
2. Copy the **ENTIRE FILE** (it's long!)
3. Paste into Supabase SQL Editor
4. Click "RUN"
5. Wait 10-20 seconds for completion

### Step 4: Verify Success
At the bottom of the SQL output, you should see:

```
Users created: 11
Threads created: 15
Replies created: 10+
Tags created: 20+
```

And a table showing threads distributed across categories.

### Step 4: Visit Your Forum
Go to your deployed site and refresh:
- https://www.tcggossip.com (once domain is configured)
- OR https://pokemon-tcg-forum-o0bn2lh7r-preems-projects-e88ad904.vercel.app

You should now see:
- ✅ Real member count
- ✅ Threads in every category
- ✅ Hot/pinned threads
- ✅ Popular tags
- ✅ Active discussions

---

## 🔐 Your Admin Account

**Email:** `admin@tcggossip.com`
**Password:** `ChangeThisPassword123!`
**Username:** `TCGAdmin`

**⚠️ IMPORTANT: Change this password immediately after first login!**

To change password:
1. Log in with above credentials
2. Go to Settings → Account
3. Change password to something secure

---

## 📝 What's in the Seed Data

### Community Members (10)
1. **PikachuMaster** - Veteran collector (850 rep)
2. **CharizardFan99** - Charizard investor (920 rep)
3. **CompetitiveAce** - Tournament player (780 rep)
4. **VintageCollector** - OG collector, VIP (1240 rep)
5. **PocketProPlayer** - TCG Pocket expert (540 rep)
6. **GradeHunter** - PSA grading specialist (690 rep)
7. **MarketWatch** - Market analyst (620 rep)
8. **PullMaster** - Box opening enthusiast (810 rep)
9. **BeginnerTrainer** - New collector (230 rep)
10. **FakeCardDetective** - Authentication mod (1050 rep)

### Sample Threads (15)
**Competitive Play (2):**
- Charizard ex meta discussion (hot/pinned)
- Lost Zone Box deck help

**TCG Pocket (2):**
- Complete F2P guide (hot/pinned)
- Pocket vs Physical debate

**Pulls & Showcases (2):**
- Insane Prismatic Evolutions pull
- Complete Pikachu collection showcase

**Authentication (2):**
- How to spot fakes (pinned)
- Base Set Charizard authentication request

**Beginner Zone (2):**
- Complete beginner's guide (pinned)
- Open vs sealed debate

**Investment & Finance (1):**
- Market trends 2025 analysis

**Plus threads in:**
- General Discussion
- Grading
- Collecting
- Market & Prices

All threads have realistic content, proper formatting, and natural discussion flow.

---

## 🎨 Customization Options

### Want to customize before running?

**Change Admin Email/Username:**
Edit lines 17-38 in SEED_DATA.sql

**Add More Threads:**
Copy the thread INSERT template and modify content

**Change User Names:**
Edit the user INSERT section (lines 42-54)

**Adjust Post Counts/Reputation:**
Modify the numbers in the profiles INSERT

---

## ⚠️ Important Notes

1. **Run AFTER category migration** - Make sure you ran `UPDATE_CATEGORIES_MIGRATION.sql` first
2. **Only run ONCE** - Running multiple times will create duplicates
3. **Safe to run** - Uses `ON CONFLICT DO NOTHING` so won't break existing data
4. **Password security** - Change admin password immediately!
5. **Timestamps** - Threads dated from last 10 days for realistic feel

---

## 🔄 If Something Goes Wrong

### To start fresh:
```sql
-- DELETE all seed data (run in Supabase)
DELETE FROM replies WHERE thread_id IN (SELECT id FROM threads);
DELETE FROM thread_tags;
DELETE FROM threads;
DELETE FROM profiles WHERE username != 'YOUR_REAL_USERNAME';
-- Then run SEED_DATA.sql again
```

### Common issues:
**"Category not found"** - Run UPDATE_CATEGORIES_MIGRATION.sql first
**"Duplicate username"** - Already ran seed data, no need to run again
**"Permission denied"** - Make sure RLS is properly configured

---

## 🎉 After Running Seed Data

Your forum will immediately look professional and active!

**Next recommended steps:**
1. ✅ Change admin password
2. ✅ Customize admin profile (add avatar, bio)
3. ✅ Reply to a few threads as admin
4. ✅ Create 1-2 more threads in your favorite categories
5. ✅ Invite beta testers to create real content

The seed data provides the foundation - now you can build on it with real community content!

---

**Questions? Issues? The seed data should work perfectly but if something goes wrong, just let me know!**
