'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Clock,
  Pin,
  Flame,
  Lock,
  Heart,
  Quote,
  Share2,
  Flag,
  Reply,
  ChevronUp,
  ChevronDown,
  Send,
  Bookmark,
  MoreHorizontal,
  Crown,
  Shield,
  Star,
  Sparkles,
  CheckCircle,
  Award
} from 'lucide-react';
import { getThreadById, getAllThreadIds, Post, ThreadDetail } from '@/lib/mock-data/posts';
import { getTrainerRank } from '@/lib/trainer-ranks';
import { formatNumber } from '@/lib/categories';

// Role badge colors and icons
const roleConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  admin: { color: '#EF4444', icon: <Crown size={12} />, label: 'Admin' },
  moderator: { color: '#8B5CF6', icon: <Shield size={12} />, label: 'Mod' },
  vip: { color: '#F59E0B', icon: <Star size={12} />, label: 'VIP' },
  member: { color: '#6B7280', icon: null, label: '' }
};

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format join date
function formatJoinDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}

// Post component
function PostCard({ post, isFirst }: { post: Post; isFirst: boolean }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const trainerRank = getTrainerRank(post.author.postCount);
  const roleInfo = roleConfig[post.author.role];

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  return (
    <article className={`post-card ${isFirst ? 'post-card-op' : ''}`}>
      {/* Author Sidebar */}
      <aside className="post-author">
        <Link href={`/u/${post.author.username}`} className="post-avatar-link">
          <div className="post-avatar">
            <Image
              src={post.author.avatar}
              alt={post.author.displayName}
              width={80}
              height={80}
              className="post-avatar-img"
            />
            {post.author.role !== 'member' && (
              <div
                className="post-role-badge"
                style={{ backgroundColor: roleInfo.color }}
              >
                {roleInfo.icon}
              </div>
            )}
          </div>
        </Link>

        <Link href={`/u/${post.author.username}`} className="post-author-name">
          {post.author.displayName}
        </Link>

        {/* Trainer Rank */}
        <div
          className="post-trainer-rank"
          style={{
            backgroundColor: `${trainerRank.color}20`,
            color: trainerRank.color,
            borderColor: `${trainerRank.color}40`
          }}
        >
          <Sparkles size={10} />
          {trainerRank.name}
        </div>

        {/* Role Badge */}
        {post.author.role !== 'member' && (
          <div
            className="post-role-tag"
            style={{ backgroundColor: `${roleInfo.color}20`, color: roleInfo.color }}
          >
            {roleInfo.label}
          </div>
        )}

        {/* Author Stats */}
        <div className="post-author-stats">
          <div className="post-author-stat">
            <span className="stat-value">{formatNumber(post.author.postCount)}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="post-author-stat">
            <span className="stat-value">{formatNumber(post.author.reputation)}</span>
            <span className="stat-label">Rep</span>
          </div>
        </div>

        <div className="post-author-joined">
          Joined {formatJoinDate(post.author.joinDate)}
        </div>

        {post.author.location && (
          <div className="post-author-location">
            📍 {post.author.location}
          </div>
        )}
      </aside>

      {/* Post Content */}
      <div className="post-main">
        {/* Post Header */}
        <header className="post-header">
          <time className="post-time">
            <Clock size={14} />
            {formatDate(post.createdAt)}
          </time>
          <div className="post-number">
            #{isFirst ? '1' : post.id.replace('p', '')}
          </div>
        </header>

        {/* Quoted Post */}
        {post.quotedPost && (
          <blockquote className="post-quote">
            <div className="post-quote-header">
              <Quote size={14} />
              <span>{post.quotedPost.author} said:</span>
            </div>
            <p>{post.quotedPost.preview}</p>
          </blockquote>
        )}

        {/* Post Content */}
        <div className="post-content">
          {post.content.split('\n').map((line, i) => {
            // Handle headers
            if (line.startsWith('# ')) {
              return <h1 key={i} className="post-h1">{line.slice(2)}</h1>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={i} className="post-h2">{line.slice(3)}</h2>;
            }
            if (line.startsWith('### ')) {
              return <h3 key={i} className="post-h3">{line.slice(4)}</h3>;
            }
            // Handle bold
            if (line.includes('**')) {
              const parts = line.split(/\*\*(.*?)\*\*/g);
              return (
                <p key={i}>
                  {parts.map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                  )}
                </p>
              );
            }
            // Handle list items
            if (line.startsWith('- ')) {
              return <li key={i} className="post-list-item">{line.slice(2)}</li>;
            }
            // Handle numbered list
            if (/^\d+\.\s/.test(line)) {
              return <li key={i} className="post-list-item">{line.slice(line.indexOf(' ') + 1)}</li>;
            }
            // Handle horizontal rule
            if (line === '---') {
              return <hr key={i} className="post-hr" />;
            }
            // Regular paragraph
            if (line.trim()) {
              return <p key={i}>{line}</p>;
            }
            return null;
          })}
        </div>

        {/* Signature */}
        {post.author.signature && (
          <div className="post-signature">
            {post.author.signature}
          </div>
        )}

        {/* Post Actions */}
        <footer className="post-actions">
          <button
            className={`post-action-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>

          <button className="post-action-btn">
            <Quote size={16} />
            <span>Quote</span>
          </button>

          <button className="post-action-btn">
            <Reply size={16} />
            <span>Reply</span>
          </button>

          <button className="post-action-btn">
            <Share2 size={16} />
            <span>Share</span>
          </button>

          <button className="post-action-btn">
            <Bookmark size={16} />
          </button>

          <button className="post-action-btn post-action-more">
            <MoreHorizontal size={16} />
          </button>
        </footer>
      </div>
    </article>
  );
}

// Reply Form Component
function ReplyForm() {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`reply-form ${isFocused ? 'focused' : ''}`}>
      <div className="reply-form-header">
        <Reply size={18} />
        <span>Write a Reply</span>
      </div>

      <div className="reply-form-body">
        <div className="reply-avatar">
          <Image
            src="/images/avatars/guest.png"
            alt="Your avatar"
            width={48}
            height={48}
          />
        </div>

        <div className="reply-editor">
          <textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={4}
          />

          <div className="reply-toolbar">
            <div className="reply-formatting">
              <button className="format-btn" title="Bold">B</button>
              <button className="format-btn" title="Italic">I</button>
              <button className="format-btn" title="Link">🔗</button>
              <button className="format-btn" title="Image">🖼️</button>
              <button className="format-btn" title="Quote">❝</button>
            </div>

            <button className="reply-submit" disabled={!content.trim()}>
              <Send size={16} />
              Post Reply
            </button>
          </div>
        </div>
      </div>

      <p className="reply-login-hint">
        <Link href="/login">Log in</Link> or <Link href="/register">sign up</Link> to reply
      </p>
    </div>
  );
}

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.id as string;
  const thread = getThreadById(threadId);

  if (!thread) {
    return (
      <div className="content-container">
        <div className="thread-not-found">
          <h1>Thread Not Found</h1>
          <p>The thread you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <Link href="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link href={`/c/${thread.categorySlug}`}>{thread.category}</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{thread.title.slice(0, 40)}...</span>
      </nav>

      {/* Thread Header */}
      <header className="thread-header">
        <div className="thread-header-top">
          <div className="thread-badges">
            {thread.isPinned && (
              <span className="badge badge-pinned">
                <Pin size={12} /> Pinned
              </span>
            )}
            {thread.isHot && (
              <span className="badge badge-hot">
                <Flame size={12} /> Hot
              </span>
            )}
            {thread.isLocked && (
              <span className="badge badge-locked">
                <Lock size={12} /> Locked
              </span>
            )}
            <span
              className="badge badge-category"
              style={{ backgroundColor: thread.categoryColor }}
            >
              {thread.category}
            </span>
          </div>
        </div>

        <h1 className="thread-title">{thread.title}</h1>

        <div className="thread-meta">
          <div className="thread-meta-item">
            <Eye size={16} />
            <span>{formatNumber(thread.viewCount)} views</span>
          </div>
          <div className="thread-meta-item">
            <MessageSquare size={16} />
            <span>{thread.replyCount} replies</span>
          </div>
          <div className="thread-meta-item">
            <Clock size={16} />
            <span>Last activity {thread.lastActivity}</span>
          </div>
        </div>

        {/* Tags */}
        {thread.tags && thread.tags.length > 0 && (
          <div className="thread-tags">
            {thread.tags.map((tag) => (
              <Link key={tag} href={`/tag/${tag}`} className="thread-tag">
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Posts */}
      <div className="posts-container">
        {thread.posts.map((post, index) => (
          <PostCard key={post.id} post={post} isFirst={index === 0} />
        ))}
      </div>

      {/* Pagination for more replies */}
      {thread.replyCount > thread.posts.length && (
        <div className="posts-pagination">
          <button className="btn btn-secondary">
            Load More Replies ({thread.replyCount - thread.posts.length + 1} remaining)
          </button>
        </div>
      )}

      {/* Reply Form */}
      {!thread.isLocked && <ReplyForm />}

      {/* Thread Locked Message */}
      {thread.isLocked && (
        <div className="thread-locked-message">
          <Lock size={20} />
          <p>This thread has been locked. No new replies can be posted.</p>
        </div>
      )}

      {/* Quick Navigation */}
      <div className="thread-nav">
        <button className="thread-nav-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ChevronUp size={20} />
          Top
        </button>
        <Link href="/" className="thread-nav-btn">
          <ArrowLeft size={20} />
          Back
        </Link>
      </div>
    </div>
  );
}
