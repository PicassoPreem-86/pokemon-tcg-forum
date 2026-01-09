# Pokemon TCG Forum - Production Deployment Checklist

> **Status**: ✅ Production Build Verified - Ready for Deployment
> **Last Updated**: 2026-01-08
> **Build Status**: All TypeScript errors resolved, production build successful

---

## 🎯 Pre-Deployment Checklist

### 1. Code Quality ✅
- [x] All TypeScript compilation errors resolved
- [x] Production build successful (`npm run build`)
- [x] ESLint configuration in place
- [x] .gitignore properly configured
- [x] All changes committed to git

### 2. Security Audit
- [ ] Environment variables properly configured
- [ ] Supabase RLS policies verified
- [ ] API keys secured (not in code)
- [ ] Security headers configured (✅ already in next.config.ts)
- [ ] CORS settings reviewed
- [ ] Rate limiting tested

### 3. Database Readiness
- [ ] All migrations applied to production Supabase
- [ ] RLS policies enabled on all tables
- [ ] Database indexes optimized
- [ ] Backup strategy in place
- [ ] Run migration: `20260108000001_create_replies_table.sql`
- [ ] Run migration: `20260108000002_add_images_to_replies.sql`

### 4. Environment Configuration
- [ ] Production `.env.production.local` configured
- [ ] All required environment variables set
- [ ] Third-party API keys configured (Google OAuth, Sentry)
- [ ] Database connection strings verified
- [ ] Service role keys secured

---

## 🔐 Required Environment Variables

### Essential Variables
```bash
# Next.js
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Sentry (Optional but recommended)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### Optional Variables
```bash
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id

# Email (if implementing)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Zero-config deployment for Next.js
- Automatic preview deployments
- Edge network CDN
- Serverless functions
- Easy environment variable management

**Steps:**
1. **Connect Repository**
   ```bash
   # Push to GitHub if not already done
   git push origin main
   ```

2. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select Next.js framework preset

3. **Configure Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from `.env.production.local`
   - Set for "Production" environment

4. **Deploy**
   - Vercel will auto-deploy on every push to main
   - First deployment will be triggered immediately

5. **Configure Domain**
   - Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

**Vercel CLI (Alternative)**
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

### Option 2: Railway

**Why Railway?**
- Simple deployment
- Database hosting included
- Environment variable management
- Auto-scaling

**Steps:**
1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   railway init
   railway link
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   # ... set all other variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

---

### Option 3: Self-Hosted (VPS/Docker)

**Requirements:**
- Node.js 18+
- PM2 or similar process manager
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt)

**Steps:**

1. **Build on Server**
   ```bash
   npm install
   npm run build
   ```

2. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "tcg-forum" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 📊 Post-Deployment Verification

### Critical Functionality Tests
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Thread creation works
- [ ] Reply posting works
- [ ] Image uploads work (if applicable)
- [ ] Search functionality works
- [ ] User profiles load
- [ ] Admin panel accessible (for admin users)

### Performance Checks
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No console errors in production
- [ ] All routes accessible
- [ ] Mobile responsiveness verified

### Monitoring Setup
- [ ] Sentry receiving error reports
- [ ] Uptime monitoring configured
- [ ] Database connection pool healthy
- [ ] Rate limiting functioning
- [ ] HTTPS working correctly

---

## 🔄 CI/CD Pipeline (Optional but Recommended)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Environment Variables Not Loading
- Verify `.env.production.local` exists
- Check Vercel/Railway dashboard for correct values
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access

### Database Connection Issues
- Verify Supabase project URL is correct
- Check if IP whitelisting is enabled (disable for serverless)
- Confirm RLS policies allow necessary operations

### Performance Issues
```bash
# Analyze bundle size
npm run build -- --analyze

# Check for large dependencies
npx depcheck
```

---

## 📈 Monitoring & Maintenance

### Daily Checks
- Monitor error rates in Sentry
- Check uptime status
- Review database performance

### Weekly Tasks
- Review and optimize slow queries
- Check for dependency updates
- Review user feedback

### Monthly Tasks
- Security audit
- Performance optimization
- Database backup verification
- Update dependencies

---

## 🚨 Rollback Procedure

If deployment fails or critical issues arise:

### Vercel
```bash
# Rollback to previous deployment
vercel rollback
```

### Railway
```bash
# Redeploy previous version
railway rollback
```

### Self-Hosted
```bash
# Revert to previous commit
git revert HEAD
npm run build
pm2 restart tcg-forum
```

---

## ✅ Deployment Complete Checklist

- [ ] Application deployed and accessible
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Monitoring tools configured
- [ ] Error tracking active (Sentry)
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Team notified

---

## 📞 Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Sentry Docs**: https://docs.sentry.io

---

**Ready to Deploy?** Follow the steps above for your chosen hosting platform!
