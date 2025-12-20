'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Tag,
  Image as ImageIcon,
  Link as LinkIcon,
  Bold,
  Italic,
  List,
  Quote,
  Code,
  Eye,
  Send,
  ArrowLeft,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
  LogIn,
  Loader2
} from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { useAuthStore } from '@/lib/auth-store';
import { useThreadStore } from '@/lib/thread-store';
import { showSuccessToast, showErrorToast } from '@/lib/toast-store';
import { sanitizeHtml } from '@/lib/sanitize';

export default function NewThreadPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { createThread } = useThreadStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string; category?: string }>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle hydration for auth state
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'image':
        newText = `![${selectedText || 'alt text'}](image-url)`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'item 1'}\n- item 2\n- item 3`;
        break;
      case 'quote':
        newText = `\n> ${selectedText || 'quoted text'}`;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        cursorOffset = selectedText ? 0 : 1;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length - cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.trim().length < 20) {
      newErrors.content = 'Content must be at least 20 characters';
    }

    if (!selectedCategory) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!isAuthenticated || !user) {
      showErrorToast('Not logged in', 'You must be logged in to create a thread');
      return;
    }

    setIsSubmitting(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create the thread
    const newThread = createThread({
      title: title.trim(),
      content: content.trim(),
      categoryId: selectedCategory,
      tags: tags,
    });

    if (newThread) {
      setIsSuccess(true);
      showSuccessToast('Thread created!', 'Redirecting to your new thread...');

      // Redirect to the new thread
      setTimeout(() => {
        router.push(`/thread/${newThread.slug}`);
      }, 1000);
    } else {
      showErrorToast('Failed to create thread', 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const selectedCategoryInfo = CATEGORIES.find(c => c.id === selectedCategory);

  // Show login prompt if not authenticated (after hydration)
  if (isHydrated && !isAuthenticated) {
    return (
      <div className="new-thread-page">
        <div className="new-thread-header">
          <Link href="/" className="btn btn-ghost">
            <ArrowLeft size={18} />
            Back
          </Link>
          <h1>
            <FileText size={24} />
            Create New Thread
          </h1>
        </div>

        <div className="auth-required-card">
          <div className="auth-required-icon">
            <LogIn size={48} />
          </div>
          <h2>Login Required</h2>
          <p>You need to be logged in to create a new thread.</p>
          <div className="auth-required-actions">
            <Link href="/login" className="btn btn-primary">
              <LogIn size={18} />
              Log In
            </Link>
            <Link href="/register" className="btn btn-secondary">
              Create Account
            </Link>
          </div>
          <p className="auth-required-hint">
            New here? <Link href="/register">Sign up</Link> to join the community!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="new-thread-page">
      {/* Header */}
      <div className="new-thread-header">
        <Link href="/" className="btn btn-ghost">
          <ArrowLeft size={18} />
          Back
        </Link>
        <h1>
          <FileText size={24} />
          Create New Thread
        </h1>
        {user && (
          <div className="new-thread-user">
            Posting as <strong>{user.displayName || user.username}</strong>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="new-thread-form">
        {/* Category Selection */}
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category <span className="required">*</span>
          </label>
          <div className="category-select-grid">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                type="button"
                className={`category-option ${selectedCategory === category.id ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  '--category-color': category.color,
                  borderColor: selectedCategory === category.id ? category.color : undefined,
                  backgroundColor: selectedCategory === category.id ? `${category.color}15` : undefined
                } as React.CSSProperties}
              >
                <span className="category-dot" style={{ backgroundColor: category.color }} />
                <span className="category-name">{category.name}</span>
                {selectedCategory === category.id && (
                  <span className="category-check">✓</span>
                )}
              </button>
            ))}
          </div>
          {errors.category && (
            <span className="form-error">
              <AlertCircle size={14} /> {errors.category}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title for your thread..."
            className={`form-input ${errors.title ? 'error' : ''}`}
            maxLength={150}
          />
          <div className="form-input-meta">
            <span className={title.length > 130 ? 'warning' : ''}>
              {title.length}/150 characters
            </span>
          </div>
          {errors.title && (
            <span className="form-error">
              <AlertCircle size={14} /> {errors.title}
            </span>
          )}
        </div>

        {/* Content Editor */}
        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="content-editor" className="form-label">
              Content <span className="required">*</span>
            </label>
            <div className="editor-tabs">
              <button
                type="button"
                className={`editor-tab ${!isPreview ? 'active' : ''}`}
                onClick={() => setIsPreview(false)}
              >
                <FileText size={14} />
                Write
              </button>
              <button
                type="button"
                className={`editor-tab ${isPreview ? 'active' : ''}`}
                onClick={() => setIsPreview(true)}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          {!isPreview && (
            <div className="editor-toolbar">
              <button type="button" onClick={() => insertFormatting('bold')} title="Bold">
                <Bold size={16} />
              </button>
              <button type="button" onClick={() => insertFormatting('italic')} title="Italic">
                <Italic size={16} />
              </button>
              <span className="toolbar-divider" />
              <button type="button" onClick={() => insertFormatting('link')} title="Link">
                <LinkIcon size={16} />
              </button>
              <button type="button" onClick={() => insertFormatting('image')} title="Image">
                <ImageIcon size={16} />
              </button>
              <span className="toolbar-divider" />
              <button type="button" onClick={() => insertFormatting('list')} title="List">
                <List size={16} />
              </button>
              <button type="button" onClick={() => insertFormatting('quote')} title="Quote">
                <Quote size={16} />
              </button>
              <button type="button" onClick={() => insertFormatting('code')} title="Code">
                <Code size={16} />
              </button>
            </div>
          )}

          {/* Editor / Preview */}
          {isPreview ? (
            <div className="editor-preview">
              {content ? (
                <div className="preview-content">
                  {content.split('\n').map((line, i) => {
                    if (!line.trim()) return <br key={i} />;
                    if (line.startsWith('> ')) {
                      return <blockquote key={i}>{line.slice(2)}</blockquote>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i}>{line.slice(2)}</li>;
                    }
                    // Basic markdown parsing with XSS protection
                    const parsed = line
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.+?)\*/g, '<em>$1</em>')
                      .replace(/`(.+?)`/g, '<code>$1</code>')
                      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
                    // SECURITY: Sanitize HTML to prevent XSS attacks
                    const sanitized = sanitizeHtml(parsed);
                    return <p key={i} dangerouslySetInnerHTML={{ __html: sanitized }} />;
                  })}
                </div>
              ) : (
                <p className="preview-empty">Nothing to preview yet. Start writing!</p>
              )}
            </div>
          ) : (
            <textarea
              id="content-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or information...

You can use Markdown formatting:
- **bold text**
- *italic text*
- [links](url)
- `code`
- > quotes"
              className={`form-textarea ${errors.content ? 'error' : ''}`}
              rows={12}
            />
          )}
          {errors.content && (
            <span className="form-error">
              <AlertCircle size={14} /> {errors.content}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">
            <Tag size={16} />
            Tags <span className="optional">(optional, up to 5)</span>
          </label>
          <div className="tags-input-wrapper">
            <div className="tags-list">
              {tags.map(tag => (
                <span key={tag} className="tag-chip">
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <div className="tag-input-container">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={handleAddTag}
                    placeholder={tags.length === 0 ? "Add tags..." : "Add another..."}
                    className="tag-input"
                    maxLength={20}
                  />
                  {tagInput && (
                    <button type="button" onClick={handleAddTag} className="tag-add-btn">
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="form-hint">Press Enter or comma to add a tag</p>
        </div>

        {/* Preview Card */}
        {(title || selectedCategoryInfo) && (
          <div className="thread-preview-card">
            <h3>Thread Preview</h3>
            <div className="preview-thread">
              {selectedCategoryInfo && (
                <span
                  className="preview-category"
                  style={{ backgroundColor: selectedCategoryInfo.color }}
                >
                  {selectedCategoryInfo.name}
                </span>
              )}
              <h4>{title || 'Your thread title'}</h4>
              {tags.length > 0 && (
                <div className="preview-tags">
                  {tags.map(tag => (
                    <span key={tag} className="preview-tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="form-actions">
          <Link href="/" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary btn-submit"
            disabled={isSubmitting || isSuccess}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="spin" />
                Creating...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle size={16} />
                Created!
              </>
            ) : (
              <>
                <Send size={16} />
                Create Thread
              </>
            )}
          </button>
        </div>
      </form>

      {/* Guidelines Sidebar */}
      <aside className="new-thread-sidebar">
        <div className="guidelines-card">
          <h3>Posting Guidelines</h3>
          <ul>
            <li>Choose the most appropriate category</li>
            <li>Use a clear, descriptive title</li>
            <li>Be respectful and constructive</li>
            <li>No spam, advertising, or self-promotion</li>
            <li>Use tags to help others find your thread</li>
            <li>Search before posting to avoid duplicates</li>
          </ul>
        </div>

        <div className="formatting-help">
          <h3>Markdown Tips</h3>
          <div className="format-examples">
            <div className="format-example">
              <code>**bold**</code>
              <span>→</span>
              <strong>bold</strong>
            </div>
            <div className="format-example">
              <code>*italic*</code>
              <span>→</span>
              <em>italic</em>
            </div>
            <div className="format-example">
              <code>[link](url)</code>
              <span>→</span>
              <a href="#">link</a>
            </div>
            <div className="format-example">
              <code>`code`</code>
              <span>→</span>
              <code>code</code>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
