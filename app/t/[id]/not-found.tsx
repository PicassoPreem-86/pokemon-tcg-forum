'use client';

import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function ThreadNotFound() {
  return (
    <div className="content-container">
      <div className="thread-not-found">
        <div className="not-found-icon">
          <Search size={64} />
        </div>
        <h1>Thread Not Found</h1>
        <p>The thread you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <p className="text-gray-400 text-sm mt-2">
          It may have been deleted by the author or removed by moderators.
        </p>
        <div className="not-found-actions">
          <Link href="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <Link href="/search" className="btn btn-secondary">
            <Search size={16} />
            Search Forums
          </Link>
        </div>
      </div>

      <style jsx>{`
        .thread-not-found {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 1rem;
          min-height: 400px;
        }

        .not-found-icon {
          color: var(--accent-primary);
          opacity: 0.3;
          margin-bottom: 1.5rem;
        }

        .thread-not-found h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .thread-not-found p {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .not-found-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: all 0.2s;
          text-decoration: none;
        }

        .btn-primary {
          background: var(--accent-primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--accent-primary-hover);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .btn-secondary:hover {
          background: var(--bg-tertiary);
        }
      `}</style>
    </div>
  );
}
