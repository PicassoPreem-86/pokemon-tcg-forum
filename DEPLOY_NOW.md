# 🚀 Deploy Your Pokemon TCG Forum NOW

Everything is ready to deploy! Just follow these 3 steps:

---

## ⚡ Quick Deploy (5 minutes)

### Step 1: Rotate Your Supabase Key (2 minutes)

**WHY:** Your service role key was exposed in git and bypasses all security.

**HOW:**
1. Open: https://supabase.com/dashboard
2. Click your project
3. Go to: **Settings** → **API**
4. Find "Service Role Key"
5. Click **"Reset"**
6. **Copy the new key** (you'll need it in Step 3)

---

### Step 2: Run the Deployment Script (1 minute)

Open your terminal and run:

```bash
cd "/Users/preem/Desktop/Trading Card Forum /pokemon-tcg-forum"
./deploy.sh
```

The script will:
- ✅ Run all tests
- ✅ Build for production
- ✅ Commit your changes
- ✅ Guide you through deployment

When prompted, choose:
- **Option A** - Deploy with Vercel CLI (recommended)
- **Option B** - Deploy via GitHub + Vercel
- **Option C** - Just verify the build

---

### Step 3: Configure Vercel (2 minutes)

When deploying, you'll be asked for environment variables.

**Copy these values from Supabase:**

Go to: https://supabase.com/dashboard → Your Project → Settings → API

Then add to Vercel:

| Variable | Where to Find It |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → Project API keys → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | The **NEW** key you just created in Step 1 ⚠️ |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel URL (e.g., https://pokemon-tcg-forum.vercel.app) |

**Important:** Use the **NEW rotated key** for `SUPABASE_SERVICE_ROLE_KEY`!

---

## ✅ That's It!

Your forum will be live in production with:
- ✅ All 163 tests passing
- ✅ Clean production build
- ✅ Security headers configured
- ✅ Health monitoring ready
- ✅ Admin panel protected

---

## 🎯 One-Line Deploy (if you have Vercel CLI)

Already have Vercel CLI installed? Just run:

```bash
cd "/Users/preem/Desktop/Trading Card Forum /pokemon-tcg-forum" && ./deploy.sh
```

Then choose **Option A** when prompted.

---

## 🆘 Need Help?

### "I don't have Vercel CLI"
The deployment script will install it for you! Just run `./deploy.sh` and choose Option A.

### "I can't find my Supabase keys"
Go to: https://supabase.com/dashboard → Your Project → Settings → API
All keys are listed there.

### "The deployment script won't run"
Make it executable first:
```bash
chmod +x "/Users/preem/Desktop/Trading Card Forum /pokemon-tcg-forum/deploy.sh"
```

### "I want to deploy manually"
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

---

## 📊 Verify Your Deployment

After deployment, test these:

```bash
# Health check (should return JSON)
curl https://your-domain.vercel.app/api/health

# Security headers (should show HSTS, X-Frame-Options, etc.)
curl -I https://your-domain.vercel.app
```

Visit in browser:
- **Homepage:** https://your-domain.vercel.app
- **Admin Panel:** https://your-domain.vercel.app/admin
- **Health Check:** https://your-domain.vercel.app/api/health

---

## 🔒 Security Note

**IMPORTANT:** The deployment script reminds you about the security steps, but here's a summary:

1. ✅ **MUST DO:** Rotate service role key (Step 1 above)
2. ⚠️ **SHOULD DO:** Clean git history to remove old secrets
3. ✅ **MUST DO:** Use the new key in Vercel (Step 3 above)

To clean git history (optional but recommended):
```bash
cd "/Users/preem/Desktop/Trading Card Forum /pokemon-tcg-forum"
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local .env.production .env.production.local' \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

⚠️ **WARNING:** This rewrites git history. Only do this if you understand the implications!

---

## 📚 More Information

- **Detailed Guide:** See `PRODUCTION_CHECKLIST.md`
- **Security Info:** See `SECURITY_WARNING.md`
- **Setup Instructions:** See `README.md`

---

**Ready? Run this now:**

```bash
cd "/Users/preem/Desktop/Trading Card Forum /pokemon-tcg-forum" && ./deploy.sh
```

**Your forum will be live in 5 minutes! 🚀**
