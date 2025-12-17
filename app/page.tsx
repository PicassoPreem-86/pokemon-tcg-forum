'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare,
  Star,
  TrendingUp,
  Award,
  BookOpen,
  Newspaper,
  ArrowLeftRight,
  Zap,
  Clock,
  Flame,
  Grid3X3,
  Search,
  Menu,
  Users,
  MessageCircle,
  FileText,
  Shield,
  ChevronRight,
  Pin
} from 'lucide-react';
import { CATEGORIES, LATEST_THREADS, FORUM_STATS, ONLINE_USERS, formatNumber, Thread as HomeThread } from '@/lib/categories';
import { useThreadStore, UserThread } from '@/lib/thread-store';
import MobileMenu from '@/components/layout/MobileMenu';
import UserMenu from '@/components/user/UserMenu';
import { initializeDemoAccount } from '@/lib/auth-store';

// Helper to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Convert user thread to home page format
function convertToHomeThread(thread: UserThread, categoryInfo: { name: string; color: string }): HomeThread {
  return {
    id: thread.id,
    title: thread.title,
    author: thread.author.username,
    authorAvatar: thread.author.avatar || '/images/avatars/default.png',
    category: categoryInfo.name,
    categoryColor: categoryInfo.color,
    replyCount: thread.postCount - 1,
    viewCount: thread.viewCount,
    lastActivity: formatTimeAgo(thread.updatedAt),
    isPinned: thread.isPinned,
    isHot: thread.isHot,
    slug: thread.slug,
  };
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="w-7 h-7" />,
  Star: <Star className="w-7 h-7" />,
  TrendingUp: <TrendingUp className="w-7 h-7" />,
  Award: <Award className="w-7 h-7" />,
  BookOpen: <BookOpen className="w-7 h-7" />,
  Newspaper: <Newspaper className="w-7 h-7" />,
  ArrowLeftRight: <ArrowLeftRight className="w-7 h-7" />,
};

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userThreads } = useThreadStore();

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Initialize demo account on mount
  useEffect(() => {
    initializeDemoAccount();
  }, []);

  // Combine user threads with mock threads for display
  const allThreads = useMemo(() => {
    // Convert user threads to home page format
    const convertedUserThreads = userThreads.map(thread => {
      const category = CATEGORIES.find(c => c.id === thread.categoryId);
      return convertToHomeThread(thread, {
        name: category?.name || 'General',
        color: category?.color || '#6366F1'
      });
    });

    // Combine and sort by most recent first
    // User threads are already sorted by createdAt in descending order
    const combined = [...convertedUserThreads, ...LATEST_THREADS];

    return combined;
  }, [userThreads]);

  return (
    <div className="page-wrapper">
      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={handleMenuClose} />
      {/* Left Sidebar - Elite Fourum Style */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo">
            <Image
              src="/images/pikachu-logo.png"
              alt=""
              width={40}
              height={40}
              className="sidebar-logo-img"
            />
            <span className="sidebar-logo-text">PIKACHU TCG</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" className="sidebar-nav-item active">
            <Clock className="w-5 h-5" />
            Latest
          </Link>
          <Link href="https://discord.gg/pokemon" className="sidebar-nav-item" target="_blank">
            <MessageCircle className="w-5 h-5" />
            Discord Server
          </Link>
          <Link href="/groups" className="sidebar-nav-item">
            <Users className="w-5 h-5" />
            Groups
          </Link>
          <Link href="/rules" className="sidebar-nav-item">
            <Shield className="w-5 h-5" />
            The Rules
          </Link>
          <Link href="/wiki" className="sidebar-nav-item">
            <FileText className="w-5 h-5" />
            Wiki
          </Link>
        </nav>

        <div className="sidebar-section-title">Categories</div>
        <ul className="sidebar-categories">
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link href={`/c/${category.slug}`} className="sidebar-category-item">
                <span
                  className="sidebar-category-dot"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <button
            className="btn btn-ghost lg:hidden"
            onClick={handleMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="header-search">
            <input type="text" placeholder="Search topics, posts, users..." />
          </div>

          <div className="header-actions">
            <UserMenu />
          </div>
        </header>

        {/* Content Container */}
        <div className="content-container">
          {/* Hero Banner with Pikachu */}
          <div className="hero-banner">
            <Image
              src="/images/pikachu-mascot.png"
              alt="Pikachu"
              width={120}
              height={120}
              className="hero-mascot"
            />
            <div className="hero-content">
              <h1 className="hero-title">
                Welcome to <span>Pikachu TCG Forum</span>
              </h1>
              <p className="hero-subtitle">
                The ultimate community for Pokemon Trading Card Game collectors, players, and enthusiasts.
              </p>
            </div>
          </div>

          {/* Welcome Box */}
          <div className="welcome-box">
            <p className="welcome-text">
              <strong>New here?</strong> Join our community of {formatNumber(FORUM_STATS.totalMembers)} trainers! Read the rules and introduce yourself.
            </p>
            <Link href="/register" className="btn btn-primary">
              Join Now
            </Link>
          </div>

          {/* Forum Statistics */}
          <div className="stats-widget">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{formatNumber(FORUM_STATS.totalMembers)}</div>
                <div className="stat-label">Members</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{formatNumber(FORUM_STATS.totalThreads)}</div>
                <div className="stat-label">Topics</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{formatNumber(FORUM_STATS.totalPosts)}</div>
                <div className="stat-label">Posts</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{formatNumber(FORUM_STATS.onlineNow)}</div>
                <div className="stat-label">Online</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <Link href="/" className="tab active">
              <Clock className="w-4 h-4 inline mr-2" />
              Latest
            </Link>
            <Link href="/hot" className="tab">
              <Flame className="w-4 h-4 inline mr-2" />
              Hot
            </Link>
            <Link href="/categories" className="tab">
              <Grid3X3 className="w-4 h-4 inline mr-2" />
              Categories
            </Link>
          </div>

          {/* Categories Grid - 2 Column Elite Fourum Style */}
          <div className="categories-grid">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/c/${category.slug}`}
                className="category-card"
              >
                <div
                  className="category-icon-box"
                  style={{ backgroundColor: category.color }}
                >
                  {iconMap[category.icon] || <MessageSquare className="w-7 h-7" />}
                </div>
                <div className="category-content">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                  <div className="category-stats">
                    <span>{formatNumber(category.threadCount)}</span> topics · <span>{formatNumber(category.postCount)}</span> posts
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Latest Threads Section */}
          <div className="section-header">
            <h2 className="section-title">
              <Zap className="w-5 h-5 lightning-icon" />
              Latest Discussions
            </h2>
            <Link href="/new" className="btn btn-primary">
              + New Topic
            </Link>
          </div>

          <div className="thread-list">
            {allThreads.map((thread) => (
              <div key={thread.id} className="thread-item">
                <div className="thread-avatar">
                  <Image
                    src={thread.authorAvatar}
                    alt={thread.author}
                    width={44}
                    height={44}
                  />
                </div>
                <div className="thread-content">
                  <div className="thread-title-row">
                    {thread.isPinned && (
                      <span className="badge badge-pinned">
                        <Pin className="w-3 h-3 inline" /> Pinned
                      </span>
                    )}
                    {thread.isHot && (
                      <span className="badge badge-hot">
                        <Flame className="w-3 h-3 inline" /> Hot
                      </span>
                    )}
                    <span
                      className="thread-tag"
                      style={{ backgroundColor: thread.categoryColor, color: 'white' }}
                    >
                      {thread.category}
                    </span>
                  </div>
                  <Link href={thread.slug ? `/thread/${thread.slug}` : `/t/${thread.id}`} className="thread-title">
                    {thread.title}
                  </Link>
                  <div className="thread-meta">
                    by <Link href={`/u/${thread.author}`}>{thread.author}</Link> · {thread.lastActivity}
                  </div>
                </div>
                <div className="thread-stats">
                  <div className="thread-stat">
                    <span className="thread-stat-value">{thread.replyCount}</span>
                    <span className="thread-stat-label">Replies</span>
                  </div>
                  <div className="thread-stat">
                    <span className="thread-stat-value">{formatNumber(thread.viewCount)}</span>
                    <span className="thread-stat-label">Views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-6">
            <button className="btn btn-secondary">
              Load More Topics
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Online Users Widget */}
          <div className="online-widget mt-8">
            <div className="online-title">
              <span className="online-dot" />
              {FORUM_STATS.onlineNow} Users Online
            </div>
            <div className="online-users">
              {ONLINE_USERS.map((user, i) => (
                <Link key={i} href={`/u/${user}`} className="online-user">
                  {user}{i < ONLINE_USERS.length - 1 ? ', ' : ''}
                </Link>
              ))}
              <span className="text-[#9CA3AF]">and {FORUM_STATS.onlineNow - ONLINE_USERS.length} more...</span>
            </div>
          </div>

          {/* Discord Widget */}
          <div className="discord-widget">
            <Zap className="discord-widget-icon text-white mx-auto" />
            <div className="discord-widget-title">Join our Discord!</div>
            <div className="discord-widget-online">
              {formatNumber(FORUM_STATS.onlineNow)} trainers online now
            </div>
            <Link href="https://discord.gg/pokemon" className="discord-widget-btn" target="_blank">
              Connect with Discord
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-copyright">
              &copy; 2024 Pikachu TCG Forum. Pokemon and all related names are trademarks of Nintendo/Creatures Inc./GAME FREAK inc.
            </div>
            <ul className="footer-links">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </footer>
      </main>
    </div>
  );
}
