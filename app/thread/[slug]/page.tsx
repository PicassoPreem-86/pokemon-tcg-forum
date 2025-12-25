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
  Heart,
  Quote,
  Share2,
  Reply,
  ChevronUp,
  Send,
  MoreHorizontal,
  Crown,
  Shield,
  Star,
  Sparkles,
  Loader2,
  CheckCircle,
  Edit2,
  Trash2,
  ImagePlus,
  X,
  GripVertical
} from 'lucide-react';
import { getThreadBySlug, isUserThread, useThreadStore } from '@/lib/thread-store';
import { useReplyStore, Reply as ReplyType, ReplyImage } from '@/lib/reply-store';
import { useAuthStore, useAuthStateAfterHydration } from '@/lib/auth-store';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast-store';
import { getTrainerRank } from '@/lib/trainer-ranks';
import { formatNumber } from '@/lib/categories';
import { insertFormatting } from '@/lib/content-renderer';
import RichContent from '@/components/forum/RichContent';
import NestedReplies from '@/components/forum/NestedReplies';
import BookmarkButton from '@/components/forum/BookmarkButton';
import ReportButton from '@/components/ReportButton';

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

  // Deterministic "random" values based on thread id to avoid hydration mismatch
  const threadHash = thread.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

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
      likes: isUserThread(thread) ? 0 : ((threadHash % 40) + 10)
    }
  ];

  // Add reply posts if thread has replies
  if (thread.postCount > 1) {
    const replyAuthors: Array<{ username: string; displayName: string; role: 'member' | 'vip' | 'admin' | 'moderator' | 'newbie'; postCount: number; reputation: number }> = [
      { username: 'PikachuFan', displayName: 'Pikachu Fan', role: 'member', postCount: 127, reputation: 340 },
      { username: 'CharizardMaster', displayName: 'Charizard Master', role: 'vip', postCount: 892, reputation: 1250 },
      { username: 'TCGCollector', displayName: 'TCG Collector', role: 'member', postCount: 256, reputation: 580 }
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
          postCount: author.postCount,
          reputation: author.reputation,
          joinDate: '2024-06-01',
          location: undefined,
          signature: undefined
        },
        createdAt: new Date(new Date(thread.createdAt).getTime() + (i + 1) * 3600000).toISOString(),
        likes: ((threadHash + i * 7) % 18) + 2
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
  threadId?: string;
}

function PostCard({ post, isFirst, onQuote, threadId }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const trainerRank = getTrainerRank(post.author.postCount);

  // Sync like count after hydration to avoid mismatch
  useEffect(() => {
    setLikeCount(post.likes);
  }, [post.likes]);
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
          <RichContent content={post.content} />
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

          {isFirst && threadId && <BookmarkButton threadId={threadId} showLabel={false} />}

          {isFirst && threadId && (
            <ReportButton
              targetType="thread"
              targetId={threadId}
              iconOnly
              className="post-action-btn"
            />
          )}

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
  parentReplyId?: string;
  replyingToAuthor?: string;
  onCancelReplyTo?: () => void;
}

function ReplyForm({
  threadId,
  onReplyPosted,
  quotedContent,
  quotedAuthor,
  onQuoteHandled,
  parentReplyId,
  replyingToAuthor,
  onCancelReplyTo
}: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ReplyImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const [touchCloneStyle, setTouchCloneStyle] = useState<React.CSSProperties | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const galleryRef = React.useRef<HTMLDivElement>(null);
  const touchStartPos = React.useRef<{ x: number; y: number } | null>(null);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLDivElement>(null);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 4 images max
    if (uploadedImages.length + files.length > 4) {
      showErrorToast('Too many images', 'You can only upload up to 4 images per reply');
      return;
    }

    setIsUploading(true);

    const newImages: ReplyImage[] = [];

    for (const file of Array.from(files)) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showErrorToast('Invalid file', `${file.name} is not an image`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast('File too large', `${file.name} exceeds 5MB limit`);
        continue;
      }

      try {
        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Get image dimensions
        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = document.createElement('img');
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.src = base64;
        });

        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: base64,
          alt: file.name,
          width: dimensions.width,
          height: dimensions.height,
        });
      } catch {
        showErrorToast('Upload failed', `Failed to process ${file.name}`);
      }
    }

    setUploadedImages(prev => [...prev, ...newImages]);
    setIsUploading(false);

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove an uploaded image
  const removeImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Drag to reorder handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add a slight delay for better visual feedback
    setTimeout(() => {
      const target = e.target as HTMLElement;
      target.classList.add('dragging');
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder images
    setUploadedImages(prev => {
      const newImages = [...prev];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(dropIndex, 0, draggedImage);
      return newImages;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.classList.remove('dragging');
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch event handlers for mobile drag-to-reorder
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    // Long press to initiate drag (300ms)
    longPressTimer.current = setTimeout(() => {
      setTouchDragIndex(index);
      setDraggedIndex(index);

      // Get the element's position for the clone
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      setTouchCloneStyle({
        position: 'fixed',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        zIndex: 10000,
        pointerEvents: 'none',
        opacity: 0.9,
        transform: 'scale(1.1)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      });

      // Vibrate for haptic feedback (if supported)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 300);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchDragIndex === null) {
      // Cancel long press if moved before drag started
      if (longPressTimer.current && touchStartPos.current) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStartPos.current.x);
        const dy = Math.abs(touch.clientY - touchStartPos.current.y);
        if (dx > 10 || dy > 10) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
      return;
    }

    e.preventDefault(); // Prevent scrolling while dragging

    const touch = e.touches[0];

    // Update clone position
    setTouchCloneStyle(prev => prev ? {
      ...prev,
      left: touch.clientX - 40, // Center the clone (half of 80px width)
      top: touch.clientY - 40,
    } : null);

    // Find which item we're over
    if (galleryRef.current) {
      const items = galleryRef.current.querySelectorAll('.image-preview-item[draggable="true"]');
      items.forEach((item, idx) => {
        const rect = item.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom &&
          idx !== touchDragIndex
        ) {
          setDragOverIndex(idx);
        }
      });
    }
  };

  const handleTouchEnd = () => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Perform reorder if we have valid indices
    if (touchDragIndex !== null && dragOverIndex !== null && touchDragIndex !== dragOverIndex) {
      setUploadedImages(prev => {
        const newImages = [...prev];
        const [draggedImage] = newImages.splice(touchDragIndex, 1);
        newImages.splice(dragOverIndex, 0, draggedImage);
        return newImages;
      });
    }

    // Reset all touch state
    setTouchDragIndex(null);
    setTouchCloneStyle(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
    touchStartPos.current = null;
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setTouchDragIndex(null);
    setTouchCloneStyle(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
    touchStartPos.current = null;
  };

  const { user, isAuthenticated, isHydrated: isAuthHydrated } = useAuthStateAfterHydration();
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

  // Handle replying to a specific reply - scroll and focus
  useEffect(() => {
    if (replyingToAuthor && parentReplyId) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        textareaRef.current?.focus();
      }, 100);
    }
  }, [replyingToAuthor, parentReplyId]);

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
      parentReplyId,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
    });

    if (newReply) {
      showSuccessToast('Reply posted!', 'Your reply has been added to the thread');
      setContent('');
      setUploadedImages([]); // Clear uploaded images
      onCancelReplyTo?.(); // Clear reply-to state
      onReplyPosted?.();
    } else {
      showErrorToast('Failed to post', 'Something went wrong. Please try again.');
    }

    setIsSubmitting(false);
  };

  // Show login prompt if not authenticated (or not yet hydrated to avoid mismatch)
  if (!isAuthHydrated || !isAuthenticated) {
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

      {/* Replying to banner */}
      {replyingToAuthor && (
        <div className="replying-to-banner">
          <span>Replying to <strong>@{replyingToAuthor}</strong></span>
          <button
            type="button"
            className="cancel-reply-to"
            onClick={onCancelReplyTo}
            title="Cancel reply"
          >
            ✕
          </button>
        </div>
      )}

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
          {/* Editor/Preview Tabs */}
          <div className="editor-tabs">
            <button
              type="button"
              className={`editor-tab ${!showPreview ? 'active' : ''}`}
              onClick={() => setShowPreview(false)}
            >
              <Edit2 size={14} />
              Write
            </button>
            <button
              type="button"
              className={`editor-tab ${showPreview ? 'active' : ''}`}
              onClick={() => setShowPreview(true)}
              disabled={!content.trim()}
            >
              <Eye size={14} />
              Preview
            </button>
          </div>

          {/* Textarea (Write mode) */}
          {!showPreview && (
            <textarea
              ref={textareaRef}
              placeholder="Share your thoughts... (Supports **bold**, *italic*, [links](url), @mentions, #hashtags)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={4}
              disabled={isSubmitting}
            />
          )}

          {/* Live Preview */}
          {showPreview && (
            <div className="reply-preview">
              {content.trim() ? (
                <RichContent content={content} />
              ) : (
                <p className="preview-empty">Nothing to preview yet...</p>
              )}
            </div>
          )}

          {/* Image Preview Gallery */}
          {uploadedImages.length > 0 && (
            <div className="image-preview-gallery" ref={galleryRef}>
              {uploadedImages.map((img, index) => (
                <div
                  key={img.id}
                  className={`image-preview-item ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''} ${touchDragIndex === index ? 'touch-dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchCancel}
                >
                  <div className="drag-handle" title="Drag to reorder">
                    <GripVertical size={14} />
                  </div>
                  <Image
                    src={img.url}
                    alt={img.alt || 'Uploaded image'}
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover', pointerEvents: 'none' }}
                  />
                  <div className="image-order-badge">{index + 1}</div>
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={() => removeImage(img.id)}
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {isUploading && (
                <div className="image-preview-item uploading">
                  <Loader2 size={24} className="spin" />
                </div>
              )}
              {/* Touch drag clone */}
              {touchDragIndex !== null && touchCloneStyle && uploadedImages[touchDragIndex] && (
                <div className="touch-drag-clone" style={touchCloneStyle}>
                  <Image
                    src={uploadedImages[touchDragIndex].url}
                    alt="Dragging"
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover', borderRadius: '6px' }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="reply-toolbar">
            <div className="reply-formatting">
              <button
                className="format-btn"
                title="Bold (**text**)"
                type="button"
                onClick={() => {
                  if (textareaRef.current) {
                    const newText = insertFormatting(textareaRef.current, 'bold');
                    setContent(newText);
                  }
                }}
              >
                <strong>B</strong>
              </button>
              <button
                className="format-btn"
                title="Italic (*text*)"
                type="button"
                onClick={() => {
                  if (textareaRef.current) {
                    const newText = insertFormatting(textareaRef.current, 'italic');
                    setContent(newText);
                  }
                }}
              >
                <em>I</em>
              </button>
              <button
                className="format-btn"
                title="Link [text](url)"
                type="button"
                onClick={() => {
                  if (textareaRef.current) {
                    const newText = insertFormatting(textareaRef.current, 'link');
                    setContent(newText);
                  }
                }}
              >
                🔗
              </button>
              <button
                className="format-btn"
                title="Code `code`"
                type="button"
                onClick={() => {
                  if (textareaRef.current) {
                    const newText = insertFormatting(textareaRef.current, 'code');
                    setContent(newText);
                  }
                }}
              >
                {'</>'}
              </button>
              <button
                className="format-btn"
                title="Quote (> text)"
                type="button"
                onClick={() => {
                  if (textareaRef.current) {
                    const newText = insertFormatting(textareaRef.current, 'quote');
                    setContent(newText);
                  }
                }}
              >
                ❝
              </button>
              <span className="format-separator" />
              <button
                className="format-btn image-upload-btn"
                title="Add images (max 4)"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadedImages.length >= 4 || isUploading}
              >
                <ImagePlus size={16} />
                {uploadedImages.length > 0 && (
                  <span className="image-count">{uploadedImages.length}/4</span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
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

// Component to render a user reply from the store (reserved for future use)
interface UserReplyCardProps {
  reply: ReplyType;
  replyNumber: number;
  onReplyDeleted?: () => void;
  onQuote?: (author: string, content: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Reserved component for future use
function UserReplyCard({ reply, replyNumber, onReplyDeleted, onQuote }: UserReplyCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
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

  // Sync like count after hydration to avoid mismatch
  useEffect(() => {
    setLikeCount(reply.likes);
  }, [reply.likes]);

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
              <RichContent content={reply.content} />
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

          <ReportButton
            targetType="reply"
            targetId={reply.id}
            iconOnly
            className="post-action-btn"
          />

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
  const { getRepliesByThread } = useReplyStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuthStore();

  // Thread loading state for Supabase fetch
  const [isLoadingThread, setIsLoadingThread] = useState(!thread);
  // Error state for graceful error display
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Thread edit/delete state
  const [isEditingThread, setIsEditingThread] = useState(false);
  const [editTitle, setEditTitle] = useState(thread?.title || '');
  const [editContent, setEditContent] = useState(isUserThread(thread) ? thread.content : '');
  const [showDeleteThreadConfirm, setShowDeleteThreadConfirm] = useState(false);
  const [isDeletingThread, setIsDeletingThread] = useState(false);
  const [isSavingThread, setIsSavingThread] = useState(false);

  // Quote state
  const [quotedAuthor, setQuotedAuthor] = useState<string | undefined>();
  const [quotedContent, setQuotedContent] = useState<string | undefined>();

  // Reply-to state (for nested replies)
  const [parentReplyId, setParentReplyId] = useState<string | undefined>();
  const [replyingToAuthor, setReplyingToAuthor] = useState<string | undefined>();

  // Hydration state for reply count (avoid SSR mismatch)
  const [isPageHydrated, setIsPageHydrated] = useState(false);
  useEffect(() => {
    setIsPageHydrated(true);
  }, []);

  // Handle quote from any post/reply
  const handleQuote = (author: string, content: string) => {
    setQuotedAuthor(author);
    setQuotedContent(content);
  };

  // Handle reply-to from nested replies
  const handleReplyTo = (replyId: string, author: string) => {
    setParentReplyId(replyId);
    setReplyingToAuthor(author);
  };

  // Cancel reply-to
  const handleCancelReplyTo = () => {
    setParentReplyId(undefined);
    setReplyingToAuthor(undefined);
  };

  // Clear quote after it's been handled
  const handleQuoteHandled = () => {
    setQuotedAuthor(undefined);
    setQuotedContent(undefined);
  };

  // Refresh thread data when needed - check local store first, then Supabase
  useEffect(() => {
    const fetchThread = async () => {
      // First, try local store (user-created threads and mock data)
      const localThread = getThread(slug);
      if (localThread) {
        setThread(localThread);
        setEditTitle(localThread.title);
        if (isUserThread(localThread)) {
          setEditContent(localThread.content);
        }
        setIsLoadingThread(false);
        return;
      }

      // If not found locally, fetch from Supabase
      setIsLoadingThread(true);
      setFetchError(null);

      // Small delay to ensure database write is committed (helps with race conditions after thread creation)
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const supabase = getSupabaseClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('threads')
          .select(`
            *,
            author:profiles!threads_author_id_fkey(
              id, username, display_name, avatar_url, role, created_at, post_count, reputation
            ),
            category:categories!threads_category_id_fkey(slug)
          `)
          .eq('slug', slug)
          .single();

        if (error || !data) {
          console.error('[ThreadPage] Supabase fetch error:', error);
          // If thread not found, it might just need more time - show a retry option
          setFetchError(error?.message || 'Thread not found');
          setIsLoadingThread(false);
          return;
        }

        // Transform Supabase data to match our Thread type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const threadData = data as any;
        const supabaseThread = {
          id: threadData.id,
          slug: threadData.slug,
          title: threadData.title,
          content: threadData.content || '',
          categoryId: threadData.category?.slug || threadData.category_id,
          authorId: threadData.author_id,
          author: {
            id: threadData.author?.id || threadData.author_id,
            username: threadData.author?.username || 'Unknown',
            displayName: threadData.author?.display_name,
            avatar: threadData.author?.avatar_url,
            role: threadData.author?.role || 'member',
            joinDate: threadData.author?.created_at || threadData.created_at,
            postCount: threadData.author?.post_count || 0,
            reputation: threadData.author?.reputation || 0,
          },
          createdAt: threadData.created_at,
          updatedAt: threadData.updated_at || threadData.created_at,
          postCount: threadData.reply_count || 0,
          viewCount: threadData.view_count || 0,
          isPinned: threadData.is_pinned || false,
          isLocked: threadData.is_locked || false,
          isHot: (threadData.view_count || 0) > 100,
          excerpt: threadData.excerpt || '',
        };

        setThread(supabaseThread);
        setEditTitle(supabaseThread.title);
        setEditContent(supabaseThread.content);
      } catch (err) {
        console.error('[ThreadPage] Failed to fetch from Supabase:', err);
        setFetchError('Failed to load thread. Please try again.');
      } finally {
        setIsLoadingThread(false);
      }
    };

    fetchThread();
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

  // Show loading state while fetching from Supabase
  if (isLoadingThread) {
    return (
      <div className="content-container">
        <div className="thread-loading" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto 1rem', color: '#9333EA' }} />
          <p style={{ color: '#9CA3AF' }}>Loading thread...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (fetchError && !thread) {
    return (
      <div className="content-container">
        <div className="thread-not-found" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h1 style={{ marginBottom: '1rem' }}>Unable to Load Thread</h1>
          <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>{fetchError}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Loader2 size={16} />
              Try Again
            </button>
            <Link href="/" className="btn btn-secondary">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
  // Only include userReplies.length after hydration to avoid SSR mismatch
  const mockReplyCount = posts.length - 1;
  const totalReplyCount = mockReplyCount + (isPageHydrated ? userReplies.length : 0);

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
          <PostCard key={post.id} post={post} isFirst={index === 0} onQuote={handleQuote} threadId={thread.id} />
        ))}
      </div>

      {/* User Replies - Nested/Threaded */}
      <NestedReplies
        threadId={thread.id}
        onQuote={handleQuote}
        onReplyTo={handleReplyTo}
        onRepliesChanged={handleReplyPosted}
      />

      {/* Reply Form */}
      <ReplyForm
        threadId={thread.id}
        onReplyPosted={handleReplyPosted}
        quotedContent={quotedContent}
        quotedAuthor={quotedAuthor}
        onQuoteHandled={handleQuoteHandled}
        parentReplyId={parentReplyId}
        replyingToAuthor={replyingToAuthor}
        onCancelReplyTo={handleCancelReplyTo}
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
