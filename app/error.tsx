'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Home, RefreshCw, MessageCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'app-error',
      },
      extra: {
        digest: error.digest,
      },
    });

    // Log the error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-icon">
          <AlertTriangle size={64} />
        </div>
        <h1 className="error-title">Something went wrong</h1>
        <p className="error-message">
          We encountered an unexpected error. The issue has been logged and our team will investigate it.
        </p>
        <div className="error-actions">
          <button onClick={reset} className="btn btn-primary">
            <RefreshCw size={18} />
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary">
            <Home size={18} />
            Go Home
          </Link>
          <Link href="/contact" className="btn btn-secondary">
            <MessageCircle size={18} />
            Report Issue
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="error-details" style={{ marginTop: '2rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '1rem' }}>
              Error Details (Development Only)
            </summary>
            <div style={{
              padding: '1rem',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '0.875rem'
            }}>
              <p style={{ color: '#ef4444', marginBottom: '0.5rem' }}>
                <strong>Error:</strong> {error.message}
              </p>
              {error.digest && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
              {error.stack && (
                <pre style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  background: 'var(--bg-primary)',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  maxHeight: '16rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
