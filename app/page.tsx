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
  Users,
  FileText,
  Shield,
  ChevronRight,
  Pin,
  PenSquare,
  Hash,
  Swords,
  Smartphone,
  Sparkles,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { getAllCategories, getLatestThreads, getForumStats, getPopularTags } from '@/lib/db/queries';
import { formatNumber } from '@/lib/categories-updated';
import HomePageClient from '@/components/home/HomePageClient';

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="w-7 h-7" />,
  Star: <Star className="w-7 h-7" />,
  TrendingUp: <TrendingUp className="w-7 h-7" />,
  Award: <Award className="w-7 h-7" />,
  BookOpen: <BookOpen className="w-7 h-7" />,
  Newspaper: <Newspaper className="w-7 h-7" />,
  ArrowLeftRight: <ArrowLeftRight className="w-7 h-7" />,
  Swords: <Swords className="w-7 h-7" />,
  Smartphone: <Smartphone className="w-7 h-7" />,
  Sparkles: <Sparkles className="w-7 h-7" />,
  ShieldCheck: <ShieldCheck className="w-7 h-7" />,
  GraduationCap: <GraduationCap className="w-7 h-7" />,
};

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

export default async function HomePage() {
  // Fetch real data from database
  const [categories, threads, stats, popularTags] = await Promise.all([
    getAllCategories(),
    getLatestThreads(15),
    getForumStats(),
    getPopularTags(12),
  ]);

  return (
    <div className="page-wrapper">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo">
            <Image
              src="/images/tcg-gossip-logo.png"
              alt="TCG Gossip"
              width={280}
              height={120}
              className="w-full h-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* New Thread Button */}
        <Link
          href="/new"
          className="flex items-center justify-center gap-2 mx-4 mb-4 px-4 py-3 font-medium rounded-lg transition-all"
          style={{
            background: 'linear-gradient(to right, #7c3aed, #9333ea)',
            color: '#ffffff',
          }}
        >
          <PenSquare className="w-5 h-5" style={{ color: '#ffffff' }} />
          <span style={{ color: '#ffffff' }}>New Thread</span>
        </Link>

        <nav className="sidebar-nav">
          <Link href="/" className="sidebar-nav-item active">
            <Clock className="w-5 h-5" />
            Latest
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
          {categories.map((category: any) => (
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
        <HomePageClient>
          {/* Content Container */}
          <div className="content-container">
            {/* Hero Banner */}
            <div className="hero-banner-full">
              <Image
                src="/images/hero-banner.png"
                alt="Welcome to TCG Gossip - The hottest community for trading card collectors"
                width={1200}
                height={400}
                className="hero-banner-image"
                priority
              />
            </div>

            {/* Welcome Box */}
            <div className="welcome-box">
              <p className="welcome-text">
                <strong>New here?</strong> Join our community{stats.totalMembers > 0 ? ` of ${formatNumber(stats.totalMembers)} collectors` : ''}! Read the rules and introduce yourself.
              </p>
              <Link href="/register" className="btn btn-primary">
                Join Now
              </Link>
            </div>

            {/* Forum Statistics */}
            <div className="stats-widget">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{formatNumber(stats.totalMembers)}</div>
                  <div className="stat-label">Members</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formatNumber(stats.totalThreads)}</div>
                  <div className="stat-label">Topics</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formatNumber(stats.totalPosts)}</div>
                  <div className="stat-label">Posts</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formatNumber(stats.onlineNow)}</div>
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

            {/* Categories Grid */}
            <h2 className="sr-only">Forum Categories</h2>
            <div className="categories-grid">
              {categories.map((category: any) => (
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
                      <span>{formatNumber(category.thread_count || 0)}</span> topics · <span>{formatNumber(category.post_count || 0)}</span> posts
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Latest Threads Section */}
            {threads.length > 0 ? (
              <>
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
                  {threads.map((thread) => (
                    <div key={thread.id} className="thread-item">
                      <div className="thread-avatar">
                        <Image
                          src={thread.author.avatar_url || '/images/avatars/default.png'}
                          alt={thread.author.username}
                          width={44}
                          height={44}
                        />
                      </div>
                      <div className="thread-content">
                        <div className="thread-title-row">
                          {thread.is_pinned && (
                            <span className="badge badge-pinned">
                              <Pin className="w-3 h-3 inline" /> Pinned
                            </span>
                          )}
                          {thread.is_hot && (
                            <span className="badge badge-hot">
                              <Flame className="w-3 h-3 inline" /> Hot
                            </span>
                          )}
                          <span
                            className="thread-tag"
                            style={{ backgroundColor: thread.category.color, color: 'white' }}
                          >
                            {thread.category.name}
                          </span>
                        </div>
                        <Link href={`/thread/${thread.slug}`} className="thread-title">
                          {thread.title}
                        </Link>
                        <div className="thread-meta">
                          by <Link href={`/u/${thread.author.username}`}>{thread.author.display_name || thread.author.username}</Link> · {formatTimeAgo(thread.updated_at)}
                        </div>
                      </div>
                      <div className="thread-stats">
                        <div className="thread-stat">
                          <span className="thread-stat-value">{thread.post_count - 1}</span>
                          <span className="thread-stat-label">Replies</span>
                        </div>
                        <div className="thread-stat">
                          <span className="thread-stat-value">{formatNumber(thread.view_count)}</span>
                          <span className="thread-stat-label">Views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-6">
                  <Link href="/hot" className="btn btn-secondary">
                    Load More Topics
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No threads yet</h3>
                <p className="text-gray-400 mb-4">Be the first to start a discussion!</p>
                <Link href="/new" className="btn btn-primary">
                  Create First Thread
                </Link>
              </div>
            )}

            {/* Popular Tags Widget */}
            {popularTags.length > 0 && (
              <div className="online-widget mt-6">
                <div className="online-title flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Popular Tags
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {popularTags.map(({ tag, count }) => (
                    <Link
                      key={tag}
                      href={`/tag/${tag}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors"
                      style={{
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        color: '#a78bfa',
                      }}
                    >
                      <Hash className="w-3 h-3" />
                      {tag}
                      <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>({count})</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="footer">
            <div className="footer-content">
              <div className="footer-copyright">
                &copy; {new Date().getFullYear()} TCG Gossip. Trading card names and images are trademarks of their respective owners.
              </div>
              <ul className="footer-links">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/terms">Terms</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
          </footer>
        </HomePageClient>
      </main>
    </div>
  );
}
