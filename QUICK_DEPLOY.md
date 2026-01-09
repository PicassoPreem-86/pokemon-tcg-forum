# 🚀 Quick Deployment Guide

> **Current Status**: ✅ Production Build Ready
> **Commit**: 4205632 - Production Readiness: TypeScript fixes, Sentry v8 migration
> **Build**: All TypeScript errors resolved, production build successful

---

## 🎯 Deploy in 5 Minutes (Vercel - Recommended)

### Prerequisites
- [ ] Supabase project created (https://supabase.com)
- [ ] GitHub repository with latest code
- [ ] Vercel account (https://vercel.com)

### Step 1: Push to GitHub
```bash
# If not already pushed
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework Preset: **Next.js** (auto-detected)
4. Click **Deploy**

### Step 3: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```bash
# REQUIRED
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # ⚠️ SECRET
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app

# OPTIONAL (Recommended)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=sntrys_xxx...  # ⚠️ SECRET
```

### Step 4: Redeploy
- Click "Redeploy" in Vercel Dashboard to apply environment variables
- Or push a commit to trigger auto-deployment

### Step 5: Run Database Migrations
In your Supabase SQL Editor, run:

```sql
-- Migration 1: Create replies table
-- Copy from: supabase/migrations/20260108000001_create_replies_table.sql

-- Migration 2: Add images to replies
-- Copy from: supabase/migrations/20260108000002_add_images_to_replies.sql
```

### Step 6: Verify Deployment ✅
- [ ] Visit your Vercel URL
- [ ] Test user registration
- [ ] Test thread creation
- [ ] Test reply posting
- [ ] Check Sentry for errors

---

## 🔧 Alternative: Railway Deploy

### Quick Deploy
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Then add environment variables in Railway dashboard.

---

## 🐳 Alternative: Self-Hosted (Docker)

### Build and Run
```bash
# Build production image
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "tcg-forum" -- start
pm2 save

# Set up Nginx reverse proxy (see DEPLOYMENT_CHECKLIST.md)
```

---

## 📊 Post-Deployment Checklist

- [ ] Homepage loads
- [ ] Registration works
- [ ] Login works
- [ ] Thread creation works
- [ ] Replies work
- [ ] Search works
- [ ] Admin panel accessible
- [ ] HTTPS enabled
- [ ] Sentry receiving errors
- [ ] No console errors

---

## 🐛 Quick Troubleshooting

### Database Connection Failed
- Check Supabase URL and keys in environment variables
- Verify IP whitelisting is OFF in Supabase (for serverless)

### Environment Variables Not Working
- Ensure variables are set in Vercel dashboard
- Redeploy after adding variables
- Client-side vars must start with `NEXT_PUBLIC_`

### Build Fails
```bash
# Local test
npm run build

# Clear cache
rm -rf .next
npm run build
```

### Can't Create Threads/Replies
- Verify Supabase RLS policies are correct
- Check service role key is set
- Review Sentry for specific errors

---

## 📞 Need Help?

- **Detailed Guide**: See `DEPLOYMENT_CHECKLIST.md`
- **Environment Vars**: See `.env.example`
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

**🎉 You're ready to deploy!** Choose Vercel for the easiest experience.
