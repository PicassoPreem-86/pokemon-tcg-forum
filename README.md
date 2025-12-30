# Pokemon TCG Forum

A modern, feature-rich forum for Pokemon Trading Card Game collectors and players. Built with Next.js 16, Supabase, and TailwindCSS.

## 🚀 Features

### Core Functionality
- **Threaded Discussions**: Create threads, reply to posts, nested conversations
- **User Authentication**: Secure auth with Supabase, email verification
- **Rich Text Editor**: Markdown support with live preview
- **Admin Panel**: Comprehensive moderation tools with server-side protection
- **Rate Limiting**: Prevent spam and abuse
- **Mentions System**: @mention other users with notifications
- **Badge System**: Gamification with achievements
- **Real-time Updates**: Live notifications and activity feeds

### Security Features
- ✅ XSS Protection with HTML sanitization
- ✅ Row Level Security (RLS) policies  
- ✅ Server-side authentication for admin routes
- ✅ CSRF protection (Next.js built-in)
- ✅ Rate limiting on destructive operations
- ✅ Audit logging for admin actions

### Admin Dashboard
- User management (roles, bans, suspensions)
- Content moderation
- Analytics and reporting
- Audit log viewer
- Category management

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Supabase Account** (free tier works)
- **Vercel Account** (optional, for deployment)

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd pokemon-tcg-forum
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL migrations in `/supabase/migrations/` in order
3. Enable Row Level Security on all tables
4. Copy your project credentials

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Keep this secret!
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

⚠️ **IMPORTANT**: Never commit `.env.local` to git!

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run specific test file:
```bash
npm test -- threads.test.ts
```

With coverage:
```bash
npm run test:coverage
```

## 🏗️ Building for Production

### Local Build
```bash
npm run build
npm start
```

### Deploy to Vercel

#### Option 1: Vercel CLI
```bash
vercel
```

#### Option 2: Git Integration
1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Configure environment variables
4. Deploy

### Environment Variables for Production

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key (secret!) | Production only |
| `NEXT_PUBLIC_SITE_URL` | https://your-domain.com | Production |

## 📁 Project Structure

```
pokemon-tcg-forum/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin panel (protected routes)
│   ├── thread/[slug]/       # Thread detail pages  
│   ├── badges/              # Badge system
│   ├── members/             # User profiles
│   └── new/                 # Create thread
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   └── layout/              # Layout components
├── lib/                     # Business logic
│   ├── actions/             # Server actions
│   ├── auth/                # Authentication helpers
│   ├── supabase/            # Supabase client setup
│   └── __tests__/           # Test files
├── supabase/               
│   └── migrations/          # Database migrations
├── public/                  # Static assets
└── styles/                  # Global styles
```

## 🔐 Security

### Critical Security Notice

**Before deploying to production, you MUST**:

1. **Rotate Supabase Service Role Key** if it was committed to git
2. Read `SECURITY_WARNING.md` for detailed instructions
3. Remove all `.env*` files from git history
4. Configure environment variables in Vercel (not in code)

### Best Practices
- Never commit `.env` files
- Use service role key only server-side
- Enable 2FA on Supabase account
- Review Row Level Security policies
- Monitor admin audit logs

## 🎨 Customization

### Themes
Edit `app/globals.css` to customize colors and styling.

### Categories  
Modify `/lib/categories.ts` to add/edit forum categories.

### Badges
Configure achievements in `/lib/badges.ts`.

## 📝 Database Migrations

Migrations are in `/supabase/migrations/`. Run them in order:

```bash
# Example using Supabase CLI
supabase db push
```

Or manually copy SQL to Supabase Dashboard → SQL Editor.

## 🐛 Troubleshooting

### Build hangs during production
- **Solution**: Turbopack has been disabled in `next.config.ts`

### "Dynamic server usage" errors  
- **Solution**: Admin routes are now marked with `export const dynamic = 'force-dynamic'`

### Tests failing
- **Solution**: Run `npm test` - all 163 tests should pass

### Authentication issues
- Check Supabase URL and keys in `.env.local`
- Verify RLS policies are enabled
- Check browser console for errors

## 📊 Performance

- **Build time**: ~5-10 seconds
- **First load**: Optimized with Next.js SSR
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Deployment Guide](./DEPLOYMENT_READY.md)
- [Admin Security](./ADMIN_SECURITY.md)
- [Security Warning](./SECURITY_WARNING.md)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review documentation files
3. Search existing GitHub issues
4. Create a new issue with detailed description

---

**Made with ❤️ for the Pokemon TCG community**
