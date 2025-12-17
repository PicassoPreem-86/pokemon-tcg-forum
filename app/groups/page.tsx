'use client';

import Link from 'next/link';
import { Users, Lock, Globe, Crown, MessageSquare } from 'lucide-react';

const groups = [
  {
    id: 1,
    name: 'Competitive Players',
    description: 'For serious tournament players discussing meta, deck techs, and competitive strategies.',
    members: 1234,
    posts: 5678,
    isPrivate: false,
    icon: '🏆',
  },
  {
    id: 2,
    name: 'Vintage Collectors',
    description: 'Collectors of Base Set, Fossil, Jungle, and other classic Pokemon cards.',
    members: 892,
    posts: 3456,
    isPrivate: false,
    icon: '📚',
  },
  {
    id: 3,
    name: 'Japanese Card Enthusiasts',
    description: 'Discussion of Japanese exclusive cards, imports, and translations.',
    members: 567,
    posts: 2134,
    isPrivate: false,
    icon: '🇯🇵',
  },
  {
    id: 4,
    name: 'Grading & Authentication',
    description: 'PSA, CGC, BGS grading discussion and authentication help.',
    members: 445,
    posts: 1876,
    isPrivate: false,
    icon: '✅',
  },
  {
    id: 5,
    name: 'Trusted Traders',
    description: 'Verified traders with established reputation. Application required.',
    members: 234,
    posts: 4532,
    isPrivate: true,
    icon: '🤝',
  },
  {
    id: 6,
    name: 'Moderator Team',
    description: 'Forum moderation team discussions and coordination.',
    members: 12,
    posts: 876,
    isPrivate: true,
    icon: '🛡️',
  },
];

export default function GroupsPage() {
  return (
    <div className="content-container">
      <div className="section-header">
        <h1 className="section-title">
          <Users className="w-6 h-6" />
          Community Groups
        </h1>
      </div>

      <p className="text-[var(--color-text-muted)] mb-8">
        Join groups based on your interests to connect with like-minded collectors and players.
      </p>

      <div className="grid gap-4">
        {groups.map((group) => (
          <div key={group.id} className="card p-5 hover:border-[var(--color-primary)] transition-colors">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{group.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">{group.name}</h2>
                  {group.isPrivate ? (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
                      <Lock className="w-3 h-3" /> Private
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                      <Globe className="w-3 h-3" /> Public
                    </span>
                  )}
                </div>
                <p className="text-[var(--color-text-muted)] text-sm mb-3">{group.description}</p>
                <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {group.members.toLocaleString()} members
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> {group.posts.toLocaleString()} posts
                  </span>
                </div>
              </div>
              <Link
                href="#"
                className="btn btn-secondary text-sm"
              >
                {group.isPrivate ? 'Request Access' : 'Join Group'}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-3">
          <Crown className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">Create a Group</h3>
        </div>
        <p className="text-[var(--color-text-muted)] text-sm">
          Have an idea for a new community group? Members with 100+ posts can request to create a new group.
          Contact the moderation team to get started.
        </p>
      </div>
    </div>
  );
}
