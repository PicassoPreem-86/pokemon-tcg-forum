'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Heart,
  Quote,
  Share2,
  Reply as ReplyIcon,
  Bookmark,
  MoreHorizontal,
  Crown,
  Shield,
  Star,
  Sparkles
} from 'lucide-react';
import { getTrainerRank } from '@/lib/trainer-ranks';
import { formatNumber } from '@/lib/categories';
import type { Reply } from '@/lib/db/thread-queries';

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

interface PostCardProps {
  post: Reply;
  isFirst: boolean;
  threadId: string;
}

export default function PostCard({ post, isFirst }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const trainerRank = getTrainerRank(post.author.post_count);
  const roleInfo = roleConfig[post.author.role] || roleConfig.member;

  // Sync like count after hydration to avoid mismatch
  useEffect(() => {
    setLikeCount(post.like_count);
  }, [post.like_count]);

  const handleLike = async () => {
    // TODO: Implement actual like functionality with server action
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
              src={post.author.avatar_url || '/images/avatars/guest.png'}
              alt={post.author.display_name || post.author.username}
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
          {post.author.display_name || post.author.username}
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
            <span className="stat-value">{formatNumber(post.author.post_count)}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="post-author-stat">
            <span className="stat-value">{formatNumber(post.author.reputation)}</span>
            <span className="stat-label">Rep</span>
          </div>
        </div>

        <div className="post-author-joined">
          Joined {formatJoinDate(post.author.created_at)}
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
            {formatDate(post.created_at)}
            {post.is_edited && <span className="edited-tag">(edited)</span>}
          </time>
          <div className="post-number">
            #{isFirst ? '1' : post.id.slice(0, 8)}
          </div>
        </header>

        {/* Post Content - Basic markdown-like rendering */}
        <div className="post-content">
          {post.content.split('\n').map((line: string, i: number) => {
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
                  {parts.map((part: string, j: number) =>
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

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="post-images">
            {post.images.map((image: { url: string; alt: string | null; width: number | null; height: number | null }, idx: number) => (
              <div key={idx} className="post-image-wrapper">
                <Image
                  src={image.url}
                  alt={image.alt || 'Post image'}
                  width={image.width || 600}
                  height={image.height || 400}
                  className="post-image"
                />
              </div>
            ))}
          </div>
        )}

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
            <ReplyIcon size={16} />
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
