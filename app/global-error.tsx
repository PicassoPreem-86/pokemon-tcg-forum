'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical error to Sentry
    Sentry.captureException(error, {
      level: 'fatal',
      tags: {
        errorBoundary: 'global-error',
      },
      extra: {
        digest: error.digest,
      },
    });

    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - Pokemon TCG Forum</title>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#0a0a0f',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1.5rem',
            color: '#ef4444'
          }}>
            ⚠️
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            Critical Error
          </h1>

          <p style={{
            fontSize: '1rem',
            color: '#9ca3af',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            We encountered a critical error that prevented the application from loading.
            This issue has been logged and our team will investigate it.
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#9333ea',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#7c3aed'}
              onMouseOut={(e) => e.currentTarget.style.background = '#9333ea'}
            >
              Try Again
            </button>

            <a
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#1f1f23',
                color: 'white',
                border: '1px solid #2a2a2f',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#2a2a2f'}
              onMouseOut={(e) => e.currentTarget.style.background = '#1f1f23'}
            >
              Go Home
            </a>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details style={{
              marginTop: '2rem',
              textAlign: 'left',
              background: '#1f1f23',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #2a2a2f'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: '600',
                marginBottom: '0.75rem',
                fontSize: '0.875rem'
              }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                fontSize: '0.75rem',
                color: '#ef4444',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '12rem'
              }}>
                {error.stack || error.message}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
