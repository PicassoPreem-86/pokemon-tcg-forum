'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
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
  Reply,
  ChevronUp,
  Send,
  Bookmark,
  MoreHorizontal,
  Crown,
  Shield,
  Star,
  Sparkles,
  Loader2,
  CheckCircle,
  Edit2,
  Trash2
} from 'lucide-react';
import { getThreadBySlug, isUserThread, useThreadStore, UserThread } from '@/lib/thread-store';
import { useReplyStore, Reply as ReplyType } from '@/lib/reply-store';
import { useAuthStore } from '@/lib/auth-store';
import { showSuccessToast, showErrorToast } from '@/lib/toast-store';
import { getTrainerRank } from '@/lib/trainer-ranks';
import { formatNumber } from '@/lib/categories';

// Role badge colors and icons
const roleConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  admin: { color: '#EF4444', icon: <Crown size={12} />, label: 'Admin' },
  moderator: { color: '#8B5CF6', icon: <Shield size={12} />, label: 'Mod' },
  vip: { color: '#F59E0B', icon: <Star size={12} />, label: 'VIP' },
  member: { color: '#6B7280', icon: null, label: '' }
};

// Generate mock post content based on thread data
function generatePosts(thread: ReturnType<typeof getThreadBySlug>) {
  if (!thread) return [];

  // Use full content if this is a user-created thread, otherwise fall back to excerpt
  const mainPostContent = isUserThread(thread)
    ? thread.content
    : thread.excerpt || `Welcome to the discussion about: ${thread.title}\n\nThis thread covers important topics for Pokemon TCG enthusiasts. Feel free to share your thoughts and experiences!`;

  const posts = [
    {
      id: 'p1',
      content: mainPostContent,
      author: {
        username: thread.author.username,
        displayName: thread.author.displayName || thread.author.username,
        avatar: '/images/avatars/default.png',
        role: thread.author.role || 'member',
        postCount: thread.author.postCount || 100,
        reputation: thread.author.reputation || 500,
        joinDate: thread.author.joinDate || '2024-01-01',
        location: thread.author.location,
        signature: thread.author.signature
      },
      createdAt: thread.createdAt,
      likes: isUserThread(thread) ? 0 : Math.floor(Math.random() * 50) + 10
    }
  ];

  // Add reply posts if thread has replies
  if (thread.postCount > 1) {
    const replyAuthors: Array<{ username: string; displayName: string; role: 'member' | 'vip' | 'admin' | 'moderator' | 'newbie' }> = [
      { username: 'PikachuFan', displayName: 'Pikachu Fan', role: 'member' },
      { username: 'CharizardMaster', displayName: 'Charizard Master', role: 'vip' },
      { username: 'TCGCollector', displayName: 'TCG Collector', role: 'member' }
    ];

    for (let i = 0; i < Math.min(thread.postCount - 1, 5); i++) {
      const author = replyAuthors[i % replyAuthors.length];
      posts.push({
        id: `p${i + 2}`,
        content: `Great thread! I've been following this topic for a while. Thanks for sharing your insights on ${thread.title.toLowerCase()}.`,
        author: {
          username: author.username,
          displayName: author.displayName,
          avatar: '/images/avatars/default.png',
          role: author.role,
          postCount: Math.floor(Math.random() * 500) + 50,
          reputation: Math.floor(Math.random() * 1000) + 100,
          joinDate: '2024-06-01',
          location: undefined,
          signature: undefined
        },
        createdAt: new Date(new Date(thread.createdAt).getTime() + (i + 1) * 3600000).toISOString(),
        likes: Math.floor(Math.random() * 20) + 1
      });
    }
  }

  return posts;
}

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
interface PostCardProps {
  post: ReturnType<typeof generatePosts>[0];
  isFirst: boolean;
  onQuote?: (author: string, content: string) => void;
}

function PostCard({ post, isFirst, onQuote }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const trainerRank = getTrainerRank(post.author.postCount);
  const roleInfo = roleConfig[post.author.role] || roleConfig.member;

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const handleQuote = () => {
    if (onQuote) {
      onQuote(post.author.displayName, post.content);
    }
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

        {/* Post Content */}
        <div className="post-content">
          {post.content.split('\n').map((line, i) => {
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

          <button className="post-action-btn" onClick={handleQuote}>
            <Quote size={16} />
            <span>Quote</span>
          </button>

          <button className="post-action-btn" onClick={handleQuote}>
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
interface ReplyFormProps {
  threadId: string;
  onReplyPosted?: () => void;
  quotedContent?: string;
  quotedAuthor?: string;
  onQuoteHandled?: () => void;
}

function ReplyForm({ threadId, onReplyPosted, quotedContent, quotedAuthor, onQuoteHandled }: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const formRef = React.useRef<HTMLDivElement>(null);

  const { user, isAuthenticated } = useAuthStore();
  const { createReply } = useReplyStore();

  // Handle dynamic quote changes
  useEffect(() => {
    if (quotedContent && quotedAuthor) {
      // Format the quote - truncate if very long
      const truncatedContent = quotedContent.length > 500
        ? quotedContent.substring(0, 500) + '...'
        : quotedContent;

      const formattedQuote = `> **${quotedAuthor}** wrote:\n> ${truncatedContent.split('\n').join('\n> ')}\n\n`;

      // Append to existing content or set new content
      setContent(prev => {
        // If there's existing content that's not just whitespace, add the quote below
        if (prev.trim()) {
          return prev + '\n\n' + formattedQuote;
        }
        return formattedQuote;
      });

      // Scroll to the form and focus
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        textareaRef.current?.focus();
        // Move cursor to end
        if (textareaRef.current) {
          const len = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(len, len);
        }
      }, 100);

      // Clear the quote from parent state
      onQuoteHandled?.();
    }
  }, [quotedContent, quotedAuthor, onQuoteHandled]);

  const handleSubmit = async () => {
    if (!content.trim() || content.trim().length < 5) {
      showErrorToast('Reply too short', 'Reply must be at least 5 characters');
      return;
    }

    if (!isAuthenticated || !user) {
      showErrorToast('Not logged in', 'You must be logged in to reply');
      return;
    }

    setIsSubmitting(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const newReply = createReply({
      threadId,
      content: content.trim(),
    });

    if (newReply) {
      showSuccessToast('Reply posted!', 'Your reply has been added to the thread');
      setContent('');
      onReplyPosted?.();
    } else {
      showErrorToast('Failed to post', 'Something went wrong. Please try again.');
    }

    setIsSubmitting(false);
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="reply-form reply-form-login">
        <div className="reply-form-header">
          <Reply size={18} />
          <span>Join the Discussion</span>
        </div>
        <p className="reply-login-hint">
          <Link href="/login">Log in</Link> or <Link href="/register">sign up</Link> to reply to this thread
        </p>
      </div>
    );
  }

  return (
    <div ref={formRef} className={`reply-form ${isFocused ? 'focused' : ''}`}>
      <div className="reply-form-header">
        <Reply size={18} />
        <span>Write a Reply</span>
        {user && (
          <span className="reply-form-user">
            Posting as <strong>{user.displayName || user.username}</strong>
          </span>
        )}
      </div>

      <div className="reply-form-body">
        <div className="reply-avatar">
          <Image
            src={user?.avatar || '/images/avatars/default.png'}
            alt="Your avatar"
            width={48}
            height={48}
          />
        </div>

        <div className="reply-editor">
          <textarea
            ref={textareaRef}
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={4}
            disabled={isSubmitting}
          />

          <div className="reply-toolbar">
            <div className="reply-formatting">
              <button className="format-btn" title="Bold" type="button">B</button>
              <button className="format-btn" title="Italic" type="button">I</button>
              <button className="format-btn" title="Link" type="button">🔗</button>
              <button className="format-btn" title="Image" type="button">🖼️</button>
              <button className="format-btn" title="Quote" type="button">❝</button>
            </div>

            <button
              className="reply-submit"
              disabled={!content.trim() || content.trim().length < 5 || isSubmitting}
              onClick={handleSubmit}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Post Reply
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Get category info by ID
function getCategoryInfo(categoryId: string) {
  const categories: Record<string, { name: string; color: string; slug: string }> = {
    'general': { name: 'General Discussion', color: '#EC4899', slug: 'general' },
    'collecting': { name: 'Collecting', color: '#F59E0B', slug: 'collecting' },
    'market': { name: 'Market & Prices', color: '#06B6D4', slug: 'market' },
    'grading': { name: 'Grading', color: '#8B5CF6', slug: 'grading' },
    'articles': { name: 'Articles & Guides', color: '#10B981', slug: 'articles' },
    'news': { name: 'News', color: '#3B82F6', slug: 'news' },
    'buy-trade': { name: 'Buy & Trade', color: '#10B981', slug: 'buy-trade' },
    'trading': { name: 'Trading', color: '#10B981', slug: 'trading' },
    'deck-building': { name: 'Deck Building', color: '#6366F1', slug: 'deck-building' },
    'tournaments': { name: 'Tournaments', color: '#EF4444', slug: 'tournaments' },
    'collections': { name: 'Collections', color: '#F59E0B', slug: 'collections' },
    'price-guides': { name: 'Price Guides', color: '#06B6D4', slug: 'price-guides' }
  };
  return categories[categoryId] || { name: 'General', color: '#6B7280', slug: 'general' };
}

// Component to render a user reply from the store
interface UserReplyCardProps {
  reply: ReplyType;
  replyNumber: number;
  onReplyDeleted?: () => void;
  onQuote?: (author: string, content: string) => void;
}

function UserReplyCard({ reply, replyNumber, onReplyDeleted, onQuote }: UserReplyCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reply.likes);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuthStore();
  const { likeReply, unlikeReply, editReply, deleteReply } = useReplyStore();
  const trainerRank = getTrainerRank(reply.author.postCount);
  const roleInfo = roleConfig[reply.author.role] || roleConfig.member;

  // Check if current user owns this reply
  const isOwner = user && user.id === reply.author.id;
  const canModerate = user && (user.role === 'admin' || user.role === 'moderator');

  // Check if current user has liked this reply
  useEffect(() => {
    if (user && reply.likedBy.includes(user.id)) {
      setLiked(true);
    }
  }, [user, reply.likedBy]);

  const handleLike = () => {
    if (!user) return;

    if (liked) {
      if (unlikeReply(reply.id)) {
        setLikeCount(likeCount - 1);
        setLiked(false);
      }
    } else {
      if (likeReply(reply.id)) {
        setLikeCount(likeCount + 1);
        setLiked(true);
      }
    }
  };

  const handleEdit = () => {
    setEditContent(reply.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditContent(reply.content);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent.trim().length < 5) {
      showErrorToast('Reply too short', 'Reply must be at least 5 characters');
      return;
    }

    setIsSaving(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const success = editReply(reply.id, editContent.trim());

    if (success) {
      showSuccessToast('Reply updated', 'Your changes have been saved');
      setIsEditing(false);
    } else {
      showErrorToast('Failed to save', 'Could not update your reply');
    }

    setIsSaving(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const success = deleteReply(reply.id);

    if (success) {
      showSuccessToast('Reply deleted', 'Your reply has been removed');
      onReplyDeleted?.();
    } else {
      showErrorToast('Failed to delete', 'Could not delete your reply');
    }

    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleQuote = () => {
    if (onQuote) {
      onQuote(reply.author.displayName, reply.content);
    }
  };

  return (
    <article className="post-card">
      {/* Author Sidebar */}
      <aside className="post-author">
        <Link href={`/u/${reply.author.username}`} className="post-avatar-link">
          <div className="post-avatar">
            <Image
              src={reply.author.avatar}
              alt={reply.author.displayName}
              width={80}
              height={80}
              className="post-avatar-img"
            />
            {reply.author.role !== 'member' && (
              <div
                className="post-role-badge"
                style={{ backgroundColor: roleInfo.color }}
              >
                {roleInfo.icon}
              </div>
            )}
          </div>
        </Link>

        <Link href={`/u/${reply.author.username}`} className="post-author-name">
          {reply.author.displayName}
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
        {reply.author.role !== 'member' && (
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
            <span className="stat-value">{formatNumber(reply.author.postCount)}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="post-author-stat">
            <span className="stat-value">{formatNumber(reply.author.reputation)}</span>
            <span className="stat-label">Rep</span>
          </div>
        </div>

        <div className="post-author-joined">
          Joined {formatJoinDate(reply.author.joinDate)}
        </div>

        {reply.author.location && (
          <div className="post-author-location">
            📍 {reply.author.location}
          </div>
        )}
      </aside>

      {/* Reply Content */}
      <div className="post-main">
        {/* Reply Header */}
        <header className="post-header">
          <time className="post-time">
            <Clock size={14} />
            {formatDate(reply.createdAt)}
            {reply.isEdited && <span className="post-edited">(edited)</span>}
          </time>
          <div className="post-number">
            #{replyNumber}
          </div>
        </header>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-dialog">
              <div className="delete-confirm-icon">
                <Trash2 size={24} />
              </div>
              <h3>Delete Reply?</h3>
              <p>This action cannot be undone. Your reply will be permanently removed.</p>
              <div className="delete-confirm-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reply Content - Edit Mode */}
        {isEditing ? (
          <div className="post-edit-form">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="post-edit-textarea"
              rows={6}
              disabled={isSaving}
              placeholder="Edit your reply..."
            />
            <div className="post-edit-actions">
              <span className="post-edit-hint">
                {editContent.trim().length < 5 ? 'Minimum 5 characters required' : `${editContent.length} characters`}
              </span>
              <div className="post-edit-buttons">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveEdit}
                  disabled={isSaving || editContent.trim().length < 5}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Reply Content - View Mode */}
            <div className="post-content">
              {reply.content.split('\n').map((line, i) => {
                if (line.trim()) {
                  // Handle quoted lines
                  if (line.startsWith('>')) {
                    return <blockquote key={i}>{line.slice(1).trim()}</blockquote>;
                  }
                  return <p key={i}>{line}</p>;
                }
                return null;
              })}
            </div>

            {/* Signature */}
            {reply.author.signature && (
              <div className="post-signature">
                {reply.author.signature}
              </div>
            )}
          </>
        )}

        {/* Reply Actions */}
        <footer className="post-actions">
          <button
            className={`post-action-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>

          <button className="post-action-btn" onClick={handleQuote}>
            <Quote size={16} />
            <span>Quote</span>
          </button>

          <button className="post-action-btn">
            <Share2 size={16} />
            <span>Share</span>
          </button>

          <button className="post-action-btn">
            <Bookmark size={16} />
          </button>

          {/* Edit/Delete buttons - only for owner or moderators */}
          {(isOwner || canModerate) && !isEditing && (
            <>
              {isOwner && (
                <button
                  className="post-action-btn post-action-edit"
                  onClick={handleEdit}
                  title="Edit reply"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
              )}
              <button
                className="post-action-btn post-action-delete"
                onClick={handleDeleteClick}
                title="Delete reply"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </>
          )}

          <button className="post-action-btn post-action-more">
            <MoreHorizontal size={16} />
          </button>
        </footer>
      </div>
    </article>
  );
}

export default function ThreadBySlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { editThread, deleteThread, getThreadBySlug: getThread } = useThreadStore();
  const [thread, setThread] = useState(() => getThreadBySlug(slug));
  const { getRepliesByThread, getReplyCount } = useReplyStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuthStore();

  // Thread edit/delete state
  const [isEditingThread, setIsEditingThread] = useState(false);
  const [editTitle, setEditTitle] = useState(thread?.title || '');
  const [editContent, setEditContent] = useState(isUserThread(thread!) ? (thread as UserThread).content : '');
  const [showDeleteThreadConfirm, setShowDeleteThreadConfirm] = useState(false);
  const [isDeletingThread, setIsDeletingThread] = useState(false);
  const [isSavingThread, setIsSavingThread] = useState(false);

  // Quote state
  const [quotedAuthor, setQuotedAuthor] = useState<string | undefined>();
  const [quotedContent, setQuotedContent] = useState<string | undefined>();

  // Handle quote from any post/reply
  const handleQuote = (author: string, content: string) => {
    setQuotedAuthor(author);
    setQuotedContent(content);
  };

  // Clear quote after it's been handled
  const handleQuoteHandled = () => {
    setQuotedAuthor(undefined);
    setQuotedContent(undefined);
  };

  // Refresh thread data when needed
  useEffect(() => {
    const currentThread = getThread(slug);
    if (currentThread) {
      setThread(currentThread);
      setEditTitle(currentThread.title);
      if (isUserThread(currentThread)) {
        setEditContent(currentThread.content);
      }
    }
  }, [slug, getThread, refreshKey]);

  // Check if user can edit/delete this thread
  const isUserCreatedThread = thread && isUserThread(thread);
  const isOwner = user && thread && 'authorId' in thread && thread.authorId === user.id;
  const canModerate = user && (user.role === 'admin' || user.role === 'moderator');
  const canEditDelete = isUserCreatedThread && (isOwner || canModerate);

  // Get user replies for this thread
  const userReplies = thread ? getRepliesByThread(thread.id) : [];

  // Callback for when a reply is posted
  const handleReplyPosted = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Thread edit handlers
  const handleEditThread = () => {
    if (thread) {
      setEditTitle(thread.title);
      if (isUserThread(thread)) {
        setEditContent(thread.content);
      }
      setIsEditingThread(true);
    }
  };

  const handleCancelEditThread = () => {
    if (thread) {
      setEditTitle(thread.title);
      if (isUserThread(thread)) {
        setEditContent(thread.content);
      }
    }
    setIsEditingThread(false);
  };

  const handleSaveThread = async () => {
    if (!thread) return;

    if (!editTitle.trim() || editTitle.trim().length < 10) {
      showErrorToast('Title too short', 'Title must be at least 10 characters');
      return;
    }

    if (!editContent.trim() || editContent.trim().length < 20) {
      showErrorToast('Content too short', 'Content must be at least 20 characters');
      return;
    }

    setIsSavingThread(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const success = editThread(thread.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
    });

    if (success) {
      showSuccessToast('Thread updated', 'Your changes have been saved');
      setIsEditingThread(false);
      setRefreshKey(prev => prev + 1);
    } else {
      showErrorToast('Failed to save', 'Could not update the thread');
    }

    setIsSavingThread(false);
  };

  // Thread delete handlers
  const handleDeleteThreadClick = () => {
    setShowDeleteThreadConfirm(true);
  };

  const handleConfirmDeleteThread = async () => {
    if (!thread) return;

    setIsDeletingThread(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const success = deleteThread(thread.id);

    if (success) {
      showSuccessToast('Thread deleted', 'The thread has been removed');
      // Redirect to the category page
      const categoryInfo = getCategoryInfo(thread.categoryId);
      router.push(`/c/${categoryInfo.slug}`);
    } else {
      showErrorToast('Failed to delete', 'Could not delete the thread');
      setIsDeletingThread(false);
      setShowDeleteThreadConfirm(false);
    }
  };

  const handleCancelDeleteThread = () => {
    setShowDeleteThreadConfirm(false);
  };

  if (!thread) {
    return (
      <div className="content-container">
        <div className="thread-not-found">
          <h1>Thread Not Found</h1>
          <p>The thread you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const posts = generatePosts(thread);
  const categoryInfo = getCategoryInfo(thread.categoryId);

  // Calculate total reply count (mock posts - 1 for OP + user replies)
  const mockReplyCount = posts.length - 1;
  const totalReplyCount = mockReplyCount + userReplies.length;

  return (
    <div className="content-container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <Link href="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link href={`/c/${categoryInfo.slug}`}>{categoryInfo.name}</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{thread.title.slice(0, 40)}...</span>
      </nav>

      {/* Delete Thread Confirmation Dialog */}
      {showDeleteThreadConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-dialog delete-thread-dialog">
            <div className="delete-confirm-icon">
              <Trash2 size={28} />
            </div>
            <h3>Delete Thread?</h3>
            <p>This will permanently delete <strong>&quot;{thread.title}&quot;</strong> and all its content. This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button
                className="btn btn-secondary"
                onClick={handleCancelDeleteThread}
                disabled={isDeletingThread}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDeleteThread}
                disabled={isDeletingThread}
              >
                {isDeletingThread ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Thread
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <span
              className="badge badge-category"
              style={{ backgroundColor: categoryInfo.color }}
            >
              {categoryInfo.name}
            </span>
          </div>

          {/* Thread Edit/Delete Buttons */}
          {canEditDelete && !isEditingThread && (
            <div className="thread-header-actions">
              {isOwner && (
                <button
                  className="thread-action-btn thread-action-edit"
                  onClick={handleEditThread}
                  title="Edit thread"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              )}
              <button
                className="thread-action-btn thread-action-delete"
                onClick={handleDeleteThreadClick}
                title="Delete thread"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Thread Title - Edit Mode */}
        {isEditingThread ? (
          <div className="thread-edit-form">
            <div className="thread-edit-field">
              <label>Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="thread-edit-title"
                disabled={isSavingThread}
                placeholder="Thread title (min 10 characters)"
              />
              <span className="thread-edit-hint">
                {editTitle.trim().length < 10 ? 'Minimum 10 characters required' : `${editTitle.length} characters`}
              </span>
            </div>
            <div className="thread-edit-field">
              <label>Content</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="thread-edit-content"
                rows={8}
                disabled={isSavingThread}
                placeholder="Thread content (min 20 characters)"
              />
              <span className="thread-edit-hint">
                {editContent.trim().length < 20 ? 'Minimum 20 characters required' : `${editContent.length} characters`}
              </span>
            </div>
            <div className="thread-edit-actions">
              <button
                className="btn btn-secondary"
                onClick={handleCancelEditThread}
                disabled={isSavingThread}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveThread}
                disabled={isSavingThread || editTitle.trim().length < 10 || editContent.trim().length < 20}
              >
                {isSavingThread ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <h1 className="thread-title">{thread.title}</h1>
        )}

        <div className="thread-meta">
          <div className="thread-meta-item">
            <Eye size={16} />
            <span>{formatNumber(thread.viewCount)} views</span>
          </div>
          <div className="thread-meta-item">
            <MessageSquare size={16} />
            <span>{totalReplyCount} replies</span>
          </div>
          <div className="thread-meta-item">
            <Clock size={16} />
            <span>Updated {formatDate(thread.updatedAt)}</span>
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

      {/* Posts - Original Post and Mock Replies */}
      <div className="posts-container">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} isFirst={index === 0} onQuote={handleQuote} />
        ))}

        {/* User Replies */}
        {userReplies.map((reply, index) => (
          <UserReplyCard
            key={reply.id}
            reply={reply}
            replyNumber={posts.length + index + 1}
            onReplyDeleted={handleReplyPosted}
            onQuote={handleQuote}
          />
        ))}
      </div>

      {/* Reply Form */}
      <ReplyForm
        threadId={thread.id}
        onReplyPosted={handleReplyPosted}
        quotedContent={quotedContent}
        quotedAuthor={quotedAuthor}
        onQuoteHandled={handleQuoteHandled}
      />

      {/* Quick Navigation */}
      <div className="thread-nav">
        <button className="thread-nav-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ChevronUp size={20} />
          Top
        </button>
        <Link href={`/c/${categoryInfo.slug}`} className="thread-nav-btn">
          <ArrowLeft size={20} />
          Back
        </Link>
      </div>
    </div>
  );
}
