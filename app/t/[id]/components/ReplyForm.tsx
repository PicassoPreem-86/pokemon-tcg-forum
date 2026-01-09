'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Reply, Send } from 'lucide-react';

interface ReplyFormProps {
  threadId: string;
}

export default function ReplyForm({ threadId }: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // TODO: Implement server action for reply submission
      console.log('Submitting reply to thread:', threadId, content);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear form on success
      setContent('');
      alert('Reply posted successfully! (Mock - implement server action)');
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`reply-form ${isFocused ? 'focused' : ''}`}>
      <div className="reply-form-header">
        <Reply size={18} />
        <span>Write a Reply</span>
      </div>

      <form onSubmit={handleSubmit} className="reply-form-body">
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
            disabled={isSubmitting}
          />

          <div className="reply-toolbar">
            <div className="reply-formatting">
              <button
                type="button"
                className="format-btn"
                title="Bold"
                onClick={() => {
                  const textarea = document.querySelector('.reply-editor textarea') as HTMLTextAreaElement;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = textarea.value;
                  const before = text.substring(0, start);
                  const selected = text.substring(start, end);
                  const after = text.substring(end);
                  setContent(`${before}**${selected}**${after}`);
                }}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                className="format-btn"
                title="Italic"
                onClick={() => {
                  const textarea = document.querySelector('.reply-editor textarea') as HTMLTextAreaElement;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = textarea.value;
                  const before = text.substring(0, start);
                  const selected = text.substring(start, end);
                  const after = text.substring(end);
                  setContent(`${before}*${selected}*${after}`);
                }}
              >
                <em>I</em>
              </button>
              <button type="button" className="format-btn" title="Link">🔗</button>
              <button type="button" className="format-btn" title="Image">🖼️</button>
              <button type="button" className="format-btn" title="Quote">❝</button>
            </div>

            <button
              type="submit"
              className="reply-submit"
              disabled={!content.trim() || isSubmitting}
            >
              <Send size={16} />
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      </form>

      <p className="reply-login-hint">
        <Link href="/login">Log in</Link> or <Link href="/register">sign up</Link> to reply
      </p>
    </div>
  );
}
