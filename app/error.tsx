'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
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
          {error.message || 'An unexpected error occurred. Please try again.'}
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
        </div>
      </div>
    </div>
  );
}
