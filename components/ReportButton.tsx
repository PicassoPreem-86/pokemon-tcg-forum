'use client';

import React, { useState } from 'react';
import { Flag, X, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { submitReport } from '@/lib/actions/reports';
import type { ReportReason, ReportTargetType } from '@/lib/actions/action-types';

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  className?: string;
  iconOnly?: boolean;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: 'spam', label: 'Spam', description: 'Promotional content, repetitive posts, or bot activity' },
  { value: 'harassment', label: 'Harassment', description: 'Bullying, personal attacks, or threatening behavior' },
  { value: 'offensive', label: 'Offensive Content', description: 'Hate speech, discriminatory language, or adult content' },
  { value: 'scam', label: 'Scam / Fraud', description: 'Fake trades, phishing attempts, or deceptive content' },
  { value: 'illegal', label: 'Illegal Content', description: 'Counterfeit goods, stolen items, or illegal activities' },
  { value: 'other', label: 'Other', description: 'Something else not listed above' },
];

export default function ReportButton({
  targetType,
  targetId,
  targetTitle,
  className = '',
  iconOnly = false,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await submitReport({
        targetType,
        targetId,
        reason: selectedReason,
        details: details.trim() || undefined,
      });

      if (response.success) {
        setResult({ success: true, message: 'Report submitted successfully. Our moderators will review it.' });
        setTimeout(() => {
          setIsOpen(false);
          setSelectedReason(null);
          setDetails('');
          setResult(null);
        }, 2000);
      } else {
        setResult({ success: false, message: response.error || 'Failed to submit report' });
      }
    } catch {
      setResult({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setSelectedReason(null);
      setDetails('');
      setResult(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`report-button ${className}`}
        title="Report"
      >
        <Flag className="w-4 h-4" />
        {!iconOnly && <span>Report</span>}
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="report-modal-overlay" onClick={handleClose}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <div className="report-modal-title">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h2>Report {targetType === 'user' ? 'User' : 'Content'}</h2>
              </div>
              <button onClick={handleClose} className="report-modal-close" disabled={isSubmitting}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {targetTitle && (
              <div className="report-modal-target">
                <span className="text-gray-400">Reporting:</span>
                <span className="font-medium">{targetTitle}</span>
              </div>
            )}

            {result ? (
              <div className={`report-result ${result.success ? 'success' : 'error'}`}>
                <p>{result.message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="report-form">
                <div className="report-reasons">
                  <label className="report-form-label">Why are you reporting this?</label>
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason.value}
                      className={`report-reason-option ${selectedReason === reason.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={() => setSelectedReason(reason.value)}
                        className="sr-only"
                      />
                      <div className="report-reason-content">
                        <span className="report-reason-label">{reason.label}</span>
                        <span className="report-reason-description">{reason.description}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="report-details">
                  <label htmlFor="report-details" className="report-form-label">
                    Additional details (optional)
                  </label>
                  <textarea
                    id="report-details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide any additional context that might help our moderators..."
                    rows={3}
                    maxLength={500}
                    className="report-textarea"
                  />
                  <span className="report-char-count">{details.length}/500</span>
                </div>

                <div className="report-actions">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="report-btn-cancel"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedReason || isSubmitting}
                    className="report-btn-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
