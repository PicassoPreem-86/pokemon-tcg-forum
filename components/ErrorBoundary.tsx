'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Store error info in state
    this.setState({ errorInfo });

    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="text-red-500">
                <AlertTriangle size={64} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              Something went wrong
            </h2>

            <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
              We encountered an unexpected error. The issue has been logged and we'll investigate it.
              Please try refreshing the page or return home.
            </p>

            <div className="flex gap-3 justify-center mb-6">
              <button
                onClick={this.reset}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:bg-[var(--accent-primary-hover)] transition-all"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg font-semibold hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] transition-all"
              >
                <Home size={18} />
                Go Home
              </Link>
            </div>

            {(process.env.NODE_ENV === 'development' || this.props.showDetails) && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-semibold mb-4">
                  Error Details {process.env.NODE_ENV === 'development' && '(Development Only)'}
                </summary>
                <div className="mt-4 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-secondary)]">
                  <p className="text-red-400 font-mono text-sm mb-3">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-[var(--text-muted)] overflow-auto max-h-64 whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
