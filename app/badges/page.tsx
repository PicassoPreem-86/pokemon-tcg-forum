'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Lock, CheckCircle, Filter, Sparkles } from 'lucide-react';
import {
  ALL_BADGES,
  BADGE_CATEGORIES,
  RARITY_INFO,
  RARITY_ORDER,
  Badge,
  BadgeCategory,
  BadgeRarity,
} from '@/lib/badges';
import { useBadgeStore } from '@/lib/badge-store';

export default function BadgesPage() {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<BadgeRarity | 'all'>('all');
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const { earnedBadges, getBadgeProgress, hasBadge, userStats } = useBadgeStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Filter badges
  const filteredBadges = ALL_BADGES.filter((badge) => {
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && badge.rarity !== selectedRarity) return false;
    if (showEarnedOnly && isHydrated && !hasBadge(badge.id)) return false;
    return true;
  });

  // Group by category for display
  const groupedBadges = BADGE_CATEGORIES.map((category) => ({
    ...category,
    badges: filteredBadges.filter((b) => b.category === category.id),
  })).filter((group) => group.badges.length > 0);

  // Stats
  const totalBadges = ALL_BADGES.length;
  const earnedCount = isHydrated ? earnedBadges.length : 0;
  const progressPercent = Math.round((earnedCount / totalBadges) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-fuchsia-900/50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-400" />
                Badges
              </h1>
              <p className="text-purple-200 mt-1">
                Earn badges by participating in the community
              </p>
            </div>

            {/* Progress Card */}
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {earnedCount}/{totalBadges}
                  </div>
                  <div className="text-xs text-purple-300">Badges Earned</div>
                </div>
                <div className="w-32">
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-purple-300 mt-1 text-center">
                    {progressPercent}% Complete
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-3 text-purple-300">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Categories
              </button>
              {BADGE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Rarity Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRarity('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedRarity === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Rarities
              </button>
              {RARITY_ORDER.map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => setSelectedRarity(rarity)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedRarity === rarity
                      ? 'text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  style={{
                    backgroundColor:
                      selectedRarity === rarity ? RARITY_INFO[rarity].color : undefined,
                  }}
                >
                  {RARITY_INFO[rarity].name}
                </button>
              ))}
            </div>

            {/* Earned Filter */}
            <button
              onClick={() => setShowEarnedOnly(!showEarnedOnly)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                showEarnedOnly
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              Earned Only
            </button>
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {groupedBadges.map((group) => (
          <div key={group.id}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{group.icon}</span>
              <h2 className="text-xl font-bold text-white">{group.name}</h2>
              <span className="text-sm text-purple-300">
                ({group.badges.length} badge{group.badges.length !== 1 ? 's' : ''})
              </span>
            </div>
            <p className="text-purple-300 text-sm mb-4">{group.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.badges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isEarned={isHydrated && hasBadge(badge.id)}
                  progress={isHydrated ? getBadgeProgress(badge.id) : 0}
                  earnedAt={
                    isHydrated
                      ? earnedBadges.find((b) => b.badgeId === badge.id)?.earnedAt
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        ))}

        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No badges found</h3>
            <p className="text-purple-300">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Your Stats Section */}
      {isHydrated && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Your Progress Stats
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              <StatCard label="Posts" value={userStats.posts} icon="📝" />
              <StatCard label="Threads" value={userStats.threads} icon="💬" />
              <StatCard label="Replies" value={userStats.replies} icon="💭" />
              <StatCard label="Days Visited" value={userStats.daysVisited} icon="📅" />
              <StatCard label="Current Streak" value={userStats.currentStreak} icon="🔥" />
              <StatCard label="Likes Given" value={userStats.likesGiven} icon="👍" />
              <StatCard label="Likes Received" value={userStats.likesReceived} icon="❤️" />
              <StatCard label="Trades" value={userStats.trades} icon="🤝" />
              <StatCard label="Collection" value={userStats.collectionSize} icon="📚" />
              <StatCard label="Solutions" value={userStats.solutions} icon="✅" />
              <StatCard label="Longest Streak" value={userStats.longestStreak} icon="⭐" />
              <StatCard
                label="Member Since"
                value={new Date(userStats.joinDate).toLocaleDateString()}
                icon="🎒"
                isText
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeCard({
  badge,
  isEarned,
  progress,
  earnedAt,
}: {
  badge: Badge;
  isEarned: boolean;
  progress: number;
  earnedAt?: string;
}) {
  const rarityInfo = RARITY_INFO[badge.rarity];

  return (
    <div
      className={`relative rounded-xl p-4 border transition-all hover:scale-[1.02] ${
        isEarned
          ? 'bg-slate-800/80 border-purple-500/40'
          : 'bg-slate-900/60 border-slate-700/40 opacity-75'
      }`}
    >
      {/* Rarity indicator */}
      <div
        className="absolute top-2 right-2 w-2 h-2 rounded-full"
        style={{ backgroundColor: rarityInfo.color }}
        title={rarityInfo.name}
      />

      {/* Badge Icon */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`text-4xl ${isEarned ? '' : 'grayscale opacity-50'}`}
          style={{ filter: isEarned ? 'none' : 'grayscale(100%)' }}
        >
          {badge.icon}
        </div>
        {isEarned ? (
          <CheckCircle className="h-5 w-5 text-green-400" />
        ) : (
          <Lock className="h-5 w-5 text-slate-500" />
        )}
      </div>

      {/* Badge Info */}
      <h3 className={`font-bold mb-1 ${isEarned ? 'text-white' : 'text-slate-400'}`}>
        {badge.name}
      </h3>
      <p className={`text-sm mb-2 ${isEarned ? 'text-purple-300' : 'text-slate-500'}`}>
        {badge.description}
      </p>

      {/* Requirement */}
      <div className="text-xs text-slate-400 mb-2">{badge.requirement.description}</div>

      {/* Progress Bar (for non-earned badges) */}
      {!isEarned && progress > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Earned date */}
      {isEarned && earnedAt && (
        <div className="text-xs text-green-400 mt-2">
          Earned {new Date(earnedAt).toLocaleDateString()}
        </div>
      )}

      {/* Rarity tag */}
      <div
        className="inline-block px-2 py-0.5 rounded text-xs font-medium mt-2"
        style={{
          backgroundColor: `${rarityInfo.color}20`,
          color: rarityInfo.color,
        }}
      >
        {rarityInfo.name}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  isText = false,
}: {
  label: string;
  value: number | string;
  icon: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`font-bold text-white ${isText ? 'text-sm' : 'text-xl'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-purple-300">{label}</div>
    </div>
  );
}
