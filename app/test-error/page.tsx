'use client';

import { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function ComponentThatThrows({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('This is a test error triggered intentionally');
  }

  return (
    <div className="p-8 bg-green-500/10 border border-green-500/30 rounded-lg">
      <p className="text-green-400">✅ Component rendered successfully - no error thrown</p>
    </div>
  );
}

export default function TestErrorPage() {
  const [triggerError, setTriggerError] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={32} className="text-yellow-500" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Error Boundary Test Page
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">
            This page tests the error boundary implementation by intentionally throwing errors.
          </p>

          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTriggerError(true);
                }}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
              >
                <AlertTriangle size={18} className="inline mr-2" />
                Trigger Error
              </button>
              <button
                onClick={() => {
                  setTriggerError(false);
                  setResetKey(prev => prev + 1);
                }}
                className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:bg-[var(--accent-primary-hover)] transition-all"
              >
                <RefreshCw size={18} className="inline mr-2" />
                Reset Component
              </button>
            </div>

            <div className="mt-8 p-6 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
                Component with Error Boundary
              </h2>
              <p className="text-[var(--text-secondary)] mb-4 text-sm">
                This component is wrapped in an ErrorBoundary that will catch and display errors gracefully.
              </p>

              <ErrorBoundary
                resetKeys={[resetKey]}
                onError={(error, errorInfo) => {
                  console.log('Error caught by boundary:', error);
                  console.log('Error info:', errorInfo);
                }}
                showDetails
              >
                <ComponentThatThrows shouldError={triggerError} />
              </ErrorBoundary>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-400 mb-2">Test Instructions:</h3>
              <ol className="text-sm text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
                <li>Click "Trigger Error" to throw an error in the component</li>
                <li>Verify the error boundary catches it and shows a friendly UI</li>
                <li>Check Sentry logs (if configured) to confirm error was logged</li>
                <li>Click "Reset Component" to recover from the error state</li>
                <li>Verify the component renders normally after reset</li>
              </ol>
            </div>

            <div className="mt-6 p-4 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-lg">
              <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Error Boundary Features:</h3>
              <ul className="text-sm text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                <li>✅ Catches errors in child components</li>
                <li>✅ Logs errors to Sentry</li>
                <li>✅ Shows friendly error UI instead of blank page</li>
                <li>✅ Provides "Try Again" button to recover</li>
                <li>✅ Supports automatic reset via resetKeys prop</li>
                <li>✅ Shows error details in development mode</li>
                <li>✅ Custom error handler callback support</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
