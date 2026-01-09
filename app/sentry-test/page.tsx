'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function SentryTestPage() {
  const [testResult, setTestResult] = useState<string>('');

  const triggerClientError = () => {
    setTestResult('Triggering client-side error...');
    setTimeout(() => {
      throw new Error('🧪 Sentry Test: Client-side error triggered!');
    }, 100);
  };

  const triggerCaughtError = () => {
    try {
      throw new Error('🧪 Sentry Test: Caught error example');
    } catch (error) {
      Sentry.captureException(error);
      setTestResult('✅ Caught error sent to Sentry (check console for confirmation)');
    }
  };

  const triggerMessage = () => {
    Sentry.captureMessage('🧪 Sentry Test: Test message from Sentry integration test', 'info');
    setTestResult('✅ Info message sent to Sentry (check console for confirmation)');
  };

  const triggerAsyncError = async () => {
    setTestResult('Triggering async error...');
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('🧪 Sentry Test: Async error triggered!');
  };

  const checkSentryStatus = () => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (dsn && dsn !== 'your_sentry_dsn_here') {
      setTestResult(`✅ Sentry is configured with DSN: ${dsn.substring(0, 30)}...`);
    } else {
      setTestResult('⚠️ Sentry DSN not configured. Add NEXT_PUBLIC_SENTRY_DSN to .env.local to activate monitoring.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            🛡️ Sentry Integration Test
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-8">
            Test error monitoring and reporting functionality
          </p>

          <div className="space-y-4 mb-8">
            <button
              onClick={checkSentryStatus}
              className="w-full btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Check Sentry Configuration Status
            </button>

            <button
              onClick={triggerMessage}
              className="w-full btn bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Send Test Message (Safe)
            </button>

            <button
              onClick={triggerCaughtError}
              className="w-full btn bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Trigger Caught Exception (Safe)
            </button>

            <button
              onClick={triggerClientError}
              className="w-full btn bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Trigger Uncaught Client Error (Will show ErrorBoundary)
            </button>

            <button
              onClick={triggerAsyncError}
              className="w-full btn bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Trigger Async Error (Will show ErrorBoundary)
            </button>
          </div>

          {testResult && (
            <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                Test Result:
              </h3>
              <p className="text-[var(--color-text-primary)] font-mono text-sm">
                {testResult}
              </p>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
              📋 Setup Instructions
            </h2>
            <ol className="space-y-3 text-[var(--color-text-secondary)]">
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-text-primary)]">1.</span>
                <span>
                  Create a free Sentry account at{' '}
                  <a
                    href="https://sentry.io/signup/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    sentry.io/signup
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-text-primary)]">2.</span>
                <span>Create a new Next.js project in Sentry</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-text-primary)]">3.</span>
                <span>Copy your DSN from the project settings</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-text-primary)]">4.</span>
                <span>
                  Add <code className="bg-[var(--color-bg-primary)] px-2 py-1 rounded text-xs">NEXT_PUBLIC_SENTRY_DSN</code> to your{' '}
                  <code className="bg-[var(--color-bg-primary)] px-2 py-1 rounded text-xs">.env.local</code> file
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-text-primary)]">5.</span>
                <span>Restart your dev server and return to this page</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-text-primary)]">6.</span>
                <span>Click "Check Sentry Configuration Status" to verify setup</span>
              </li>
            </ol>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                💡 <strong>Tip:</strong> Open your browser's DevTools Console to see Sentry initialization messages
                and confirmation when errors are sent.
              </p>
            </div>

            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400">
                ⚠️ <strong>Note:</strong> In development mode, Sentry is silent by default to avoid noise.
                Set <code className="bg-[var(--color-bg-primary)] px-2 py-1 rounded text-xs">SENTRY_TEST_MODE=true</code> in{' '}
                <code className="bg-[var(--color-bg-primary)] px-2 py-1 rounded text-xs">.env.local</code> to enable full reporting in dev.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
              🎯 What Each Test Does
            </h2>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div>
                <strong className="text-[var(--color-text-primary)]">Check Status:</strong> Verifies if Sentry DSN is configured
              </div>
              <div>
                <strong className="text-[var(--color-text-primary)]">Test Message:</strong> Sends an info-level message to Sentry (won't trigger ErrorBoundary)
              </div>
              <div>
                <strong className="text-[var(--color-text-primary)]">Caught Exception:</strong> Manually captures and reports an error (won't trigger ErrorBoundary)
              </div>
              <div>
                <strong className="text-[var(--color-text-primary)]">Client Error:</strong> Throws an uncaught error that triggers the ErrorBoundary
              </div>
              <div>
                <strong className="text-[var(--color-text-primary)]">Async Error:</strong> Throws an async error that triggers the ErrorBoundary
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
