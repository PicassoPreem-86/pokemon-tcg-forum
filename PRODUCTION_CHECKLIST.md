# Production Deployment Checklist

## ✅ Pre-Deployment Status

### Build & Tests
- ✅ **Production Build**: Compiles successfully in ~5 seconds
- ✅ **All Tests Passing**: 163/163 tests (100% pass rate)
- ✅ **No Build Errors**: Clean build with no static rendering errors
- ✅ **TypeScript**: No type errors

### Security Hardening
- ✅ **Security Headers**: HSTS, X-Frame-Options, CSP, XSS Protection configured
- ✅ **Admin Authentication**: Server-side auth with dynamic rendering
- ✅ **Rate Limiting**: Implemented for spam prevention
- ✅ **XSS Protection**: HTML sanitization in place
- ✅ **Environment Template**: `.env.example` created (safe to commit)

### Documentation
- ✅ **README.md**: Complete setup and deployment guide
- ✅ **SECURITY_WARNING.md**: Critical security instructions
- ✅ **Health Check Endpoint**: `/api/health` for monitoring
- ✅ **404 Page**: Custom error page created

---

## 🚨 CRITICAL: Required Actions Before Deployment

### 1. Rotate Supabase Service Role Key
**Status**: ⚠️ **REQUIRED** - See `SECURITY_WARNING.md`

The service role key was exposed in git history and MUST be rotated:

```bash
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API → Service Role Key
4. Click "Reset" to generate new key
5. Copy the new key (you won't see it again!)
```

### 2. Clean Git History
**Status**: ⚠️ **REQUIRED** - See `SECURITY_WARNING.md`

Remove all `.env` files from git history:

```bash
# WARNING: This rewrites git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local .env.production .env.production.local' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with your team!)
git push origin --force --all
```

### 3. Configure Vercel Environment Variables
**Status**: ⚠️ **REQUIRED**

In Vercel Dashboard → Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | **NEW rotated key** | **Production only** |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` | Production |

⚠️ **NEVER commit these values to git!**

---

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

2. Import project in [Vercel Dashboard](https://vercel.com/new)

3. Configure environment variables (see above)

4. Click "Deploy"

---

## ✅ Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-30T...",
  "environment": "production",
  "version": "1.0.0"
}
```

### 2. Admin Access Test
1. Navigate to `https://your-domain.com/admin`
2. Verify you're redirected to login if not authenticated
3. Login with admin account
4. Verify admin dashboard loads correctly

### 3. Core Features Test
- [ ] User registration works
- [ ] Email verification sends
- [ ] Thread creation works
- [ ] Reply posting works
- [ ] @mentions send notifications
- [ ] Admin panel accessible
- [ ] Rate limiting prevents spam

### 4. Security Headers Test
```bash
curl -I https://your-domain.com
```

Verify headers include:
- `Strict-Transport-Security`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

---

## 📊 Monitoring Setup (Recommended)

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking (Sentry)
```bash
npx @sentry/wizard@latest -i nextjs
```

Follow the wizard to configure error tracking.

---

## 🔒 Security Best Practices

### After Deployment
- [ ] Enable 2FA on Supabase account
- [ ] Review Row Level Security (RLS) policies
- [ ] Monitor admin audit logs regularly
- [ ] Set up automated database backups
- [ ] Configure custom domain with SSL
- [ ] Review Vercel deployment logs

### Ongoing
- [ ] Rotate service role key every 90 days
- [ ] Review security headers quarterly
- [ ] Update dependencies monthly
- [ ] Monitor for security advisories
- [ ] Review audit logs weekly

---

## 📈 Performance

Current benchmarks:
- **Build Time**: ~5 seconds
- **Test Suite**: 163 tests in ~10 seconds
- **Static Pages**: 35 pages pre-rendered
- **Dynamic Routes**: 8 admin routes
- **Bundle Size**: Optimized with tree-shaking

Expected Lighthouse scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

---

## 🆘 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify Supabase credentials are valid
- Review build logs in Vercel dashboard

### Admin Panel 401/403 Errors
- Verify service role key is correct
- Check RLS policies in Supabase
- Ensure user has admin/moderator role in database

### Tests Failing
```bash
npm test
```
All 163 tests should pass. If not, review error messages.

### Database Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check Supabase project is not paused
- Review Supabase service health status

---

## 📞 Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- Project README: `README.md`
- Security Warning: `SECURITY_WARNING.md`

---

## ✅ Final Checklist

Before marking deployment as complete:

- [ ] Supabase service role key rotated
- [ ] Git history cleaned of secrets
- [ ] Vercel environment variables configured
- [ ] Production deployment successful
- [ ] Health check endpoint responding
- [ ] Admin panel accessible
- [ ] Core features tested and working
- [ ] Security headers verified
- [ ] Monitoring configured
- [ ] Team notified of deployment

---

**Last Updated**: 2025-12-30
**Build Status**: ✅ Production Ready
**Test Coverage**: 163/163 tests passing
**Security Status**: ⚠️ Requires key rotation (see Section 1)
