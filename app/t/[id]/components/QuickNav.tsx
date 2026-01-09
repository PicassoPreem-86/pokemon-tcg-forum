'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronUp, ArrowLeft } from 'lucide-react';

export default function QuickNav() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="thread-nav">
      <button
        className="thread-nav-btn"
        onClick={scrollToTop}
      >
        <ChevronUp size={20} />
        Top
      </button>
      <Link href="/" className="thread-nav-btn">
        <ArrowLeft size={20} />
        Back
      </Link>
    </div>
  );
}
