'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Quote,
  Share2,
  Reply,
  Bookmark,
  MoreHorizontal,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Crown,
  Shield,
  Star,
  MessageSquare,
  X,
  ZoomIn,
  ChevronLeft
} from 'lucide-react';
import { Reply as ReplyType, useReplyStore, ReplyImage } from '@/lib/reply-store';
import { useAuthStore } from '@/lib/auth-store';
import { showSuccessToast, showErrorToast } from '@/lib/toast-store';
import { getTrainerRank } from '@/lib/trainer-ranks';
import { formatNumber } from '@/lib/categories';
import RichContent from './RichContent';

// Role badge colors and icons
const roleConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  admin: { color: '#EF4444', icon: <Crown size={10} />, label: 'Admin' },
  moderator: { color: '#8B5CF6', icon: <Shield size={10} />, label: 'Mod' },
  vip: { color: '#F59E0B', icon: <Star size={10} />, label: 'VIP' },
  member: { color: '#6B7280', icon: null, label: '' }
};

// Image Lightbox Component - Uses portal to render to document.body
interface ImageLightboxProps {
  images: ReplyImage[];
  initialIndex: number;
  onClose: () => void;
}

function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);
  const currentImage = images[currentIndex];

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [currentIndex, images.length, onClose]);

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const lightboxContent = (
    <div className="image-lightbox-overlay" onClick={onClose}>
      <div className="image-lightbox-container" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="lightbox-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              className={`lightbox-nav lightbox-prev ${currentIndex === 0 ? 'disabled' : ''}`}
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className={`lightbox-nav lightbox-next ${currentIndex === images.length - 1 ? 'disabled' : ''}`}
              onClick={goToNext}
              disabled={currentIndex === images.length - 1}
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        {/* Main image */}
        <div className="lightbox-image-wrapper">
          <img
            src={currentImage.url}
            alt={currentImage.alt || 'Enlarged image'}
            className="lightbox-image"
          />
        </div>

        {/* Image counter and caption */}
        <div className="lightbox-footer">
          {images.length > 1 && (
            <span className="lightbox-counter">
              {currentIndex + 1} / {images.length}
            </span>
          )}
          {currentImage.alt && (
            <span className="lightbox-caption">{currentImage.alt}</span>
          )}
        </div>

        {/* Thumbnail strip for multiple images */}
        {images.length > 1 && (
          <div className="lightbox-thumbnails">
            {images.map((img, index) => (
              <button
                key={img.id}
                className={`lightbox-thumb ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              >
                <img src={img.url} alt={img.alt || `Thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Use portal to render lightbox to document.body
  if (!mounted) return null;
  return createPortal(lightboxContent, document.body);
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

// Compact format for nested replies
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface NestedReplyCardProps {
  reply: ReplyType;
  depth?: number;
  maxDepth?: number;
  onQuote?: (author: string, content: string) => void;
  onReplyTo?: (replyId: string, author: string) => void;
  onDeleted?: () => void;
}

export function NestedReplyCard({
  reply,
  depth = 0,
  maxDepth = 3,
  onQuote,
  onReplyTo,
  onDeleted
}: NestedReplyCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { user } = useAuthStore();
  const { likeReply, unlikeReply, editReply, deleteReply, getNestedReplies } = useReplyStore();
  const trainerRank = getTrainerRank(reply.author.postCount);
  const roleInfo = roleConfig[reply.author.role] || roleConfig.member;

  // Get nested replies to this reply
  const nestedReplies = getNestedReplies(reply.id);
  const hasNested = nestedReplies.length > 0;

  // Check if current user owns this reply
  const isOwner = user && user.id === reply.author.id;
  const canModerate = user && (user.role === 'admin' || user.role === 'moderator');

  // Sync like count after hydration to avoid mismatch
  React.useEffect(() => {
    setLikeCount(reply.likes);
  }, [reply.likes]);

  // Check if current user has liked this reply
  React.useEffect(() => {
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

  const handleDeleteClick = () => setShowDeleteConfirm(true);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const success = deleteReply(reply.id);

    if (success) {
      showSuccessToast('Reply deleted', 'Your reply has been removed');
      onDeleted?.();
    } else {
      showErrorToast('Failed to delete', 'Could not delete your reply');
    }

    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleQuote = () => {
    if (onQuote) {
      onQuote(reply.author.displayName, reply.content);
    }
  };

  const handleReplyTo = () => {
    if (onReplyTo) {
      onReplyTo(reply.id, reply.author.displayName);
    }
  };

  // Determine if this is a compact (nested) view
  const isCompact = depth > 0;

  return (
    <div className={`nested-reply-container ${isCompact ? 'compact' : ''}`} style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      {/* Thread line for visual connection */}
      {depth > 0 && <div className="reply-thread-connector" />}

      <article className={`nested-reply ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Collapse toggle for replies with children */}
        {hasNested && (
          <button
            className="collapse-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand replies' : 'Collapse replies'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
        )}

        {/* Reply Header - Compact */}
        <div className="nested-reply-header">
          <Link href={`/u/${reply.author.username}`} className="nested-reply-avatar">
            <Image
              src={reply.author.avatar}
              alt={reply.author.displayName}
              width={isCompact ? 28 : 36}
              height={isCompact ? 28 : 36}
            />
            {reply.author.role !== 'member' && (
              <span
                className="mini-role-badge"
                style={{ backgroundColor: roleInfo.color }}
              >
                {roleInfo.icon}
              </span>
            )}
          </Link>

          <div className="nested-reply-meta">
            <Link href={`/u/${reply.author.username}`} className="nested-reply-author">
              {reply.author.displayName}
            </Link>
            <span
              className="nested-reply-rank"
              style={{ color: trainerRank.color }}
            >
              {trainerRank.name}
            </span>
            <span className="nested-reply-time">
              · {formatTimeAgo(reply.createdAt)}
              {reply.isEdited && <span className="edited-badge">(edited)</span>}
            </span>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="inline-delete-confirm">
            <span>Delete this reply?</span>
            <button
              className="btn-mini btn-danger"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 size={12} className="spin" /> : 'Delete'}
            </button>
            <button
              className="btn-mini"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Reply Content */}
        {isEditing ? (
          <div className="nested-reply-edit">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={isSaving}
              rows={3}
            />
            <div className="nested-reply-edit-actions">
              <button className="btn-mini" onClick={handleCancelEdit} disabled={isSaving}>
                Cancel
              </button>
              <button
                className="btn-mini btn-primary"
                onClick={handleSaveEdit}
                disabled={isSaving || editContent.trim().length < 5}
              >
                {isSaving ? <Loader2 size={12} className="spin" /> : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="nested-reply-content">
            <RichContent content={reply.content} />

            {/* Display attached images */}
            {reply.images && reply.images.length > 0 && (
              <div className="reply-images-gallery">
                {reply.images.map((img, index) => (
                  <button
                    key={img.id}
                    className="reply-image-item clickable"
                    onClick={() => {
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                    type="button"
                    aria-label="Click to enlarge image"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || 'Attached image'}
                      width={img.width && img.width > 400 ? 400 : (img.width || 200)}
                      height={img.height && img.height > 300 ? 300 : (img.height || 150)}
                      style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                    />
                    <div className="image-zoom-overlay">
                      <ZoomIn size={24} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Image Lightbox */}
            {lightboxOpen && reply.images && reply.images.length > 0 && (
              <ImageLightbox
                images={reply.images}
                initialIndex={lightboxIndex}
                onClose={() => setLightboxOpen(false)}
              />
            )}
          </div>
        )}

        {/* Reply Actions */}
        {!isEditing && !showDeleteConfirm && (
          <div className="nested-reply-actions">
            <button
              className={`action-btn ${liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            {depth < maxDepth && (
              <button className="action-btn" onClick={handleReplyTo}>
                <Reply size={14} />
                <span>Reply</span>
              </button>
            )}

            <button className="action-btn" onClick={handleQuote}>
              <Quote size={14} />
            </button>

            {(isOwner || canModerate) && (
              <>
                {isOwner && (
                  <button className="action-btn" onClick={handleEdit}>
                    <Edit2 size={14} />
                  </button>
                )}
                <button className="action-btn action-delete" onClick={handleDeleteClick}>
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </article>

      {/* Nested Replies (recursive) */}
      {hasNested && !isCollapsed && (
        <div className="nested-replies-list">
          {nestedReplies.map((nestedReply) => (
            <NestedReplyCard
              key={nestedReply.id}
              reply={nestedReply}
              depth={depth + 1}
              maxDepth={maxDepth}
              onQuote={onQuote}
              onReplyTo={onReplyTo}
              onDeleted={onDeleted}
            />
          ))}
        </div>
      )}

      {/* Collapsed indicator */}
      {hasNested && isCollapsed && (
        <button
          className="collapsed-indicator"
          onClick={() => setIsCollapsed(false)}
        >
          <MessageSquare size={14} />
          {nestedReplies.length} {nestedReplies.length === 1 ? 'reply' : 'replies'} hidden
        </button>
      )}
    </div>
  );
}

// Wrapper component for displaying all nested replies under a thread
interface NestedRepliesProps {
  threadId: string;
  onQuote?: (author: string, content: string) => void;
  onReplyTo?: (replyId: string, author: string) => void;
  onRepliesChanged?: () => void;
}

export default function NestedReplies({
  threadId,
  onQuote,
  onReplyTo,
  onRepliesChanged
}: NestedRepliesProps) {
  const { getTopLevelReplies } = useReplyStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark as hydrated after mount to avoid SSR mismatch
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't render anything until hydrated to avoid mismatch
  // (server has no localStorage data, client might have replies)
  if (!isHydrated) {
    return null;
  }

  const topLevelReplies = getTopLevelReplies(threadId);

  if (topLevelReplies.length === 0) {
    return null;
  }

  return (
    <div className="nested-replies-container">
      {topLevelReplies.map((reply) => (
        <NestedReplyCard
          key={reply.id}
          reply={reply}
          depth={0}
          maxDepth={3}
          onQuote={onQuote}
          onReplyTo={onReplyTo}
          onDeleted={onRepliesChanged}
        />
      ))}
    </div>
  );
}
