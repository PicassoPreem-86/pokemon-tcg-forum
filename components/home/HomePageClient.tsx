'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import UserMenu from '@/components/user/UserMenu';

interface HomePageClientProps {
  children: React.ReactNode;
}

export default function HomePageClient({ children }: HomePageClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="top-header">
        <button
          className="btn btn-ghost lg:hidden"
          onClick={() => {
            // Mobile menu handled by parent
            const event = new CustomEvent('toggleMobileMenu');
            window.dispatchEvent(event);
          }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search topics, posts, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="header-actions">
          <UserMenu />
        </div>
      </header>
      {children}
    </>
  );
}
