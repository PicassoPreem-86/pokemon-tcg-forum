import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Badge,
  EarnedBadge,
  ALL_BADGES,
  getBadgeById,
  POSTING_BADGES,
  THREAD_BADGES,
  VISITING_BADGES,
  STREAK_BADGES,
  ENGAGEMENT_BADGES,
  COMMUNITY_BADGES,
} from './badges';

export interface UserStats {
  posts: number;
  threads: number;
  replies: number;
  daysVisited: number;
  currentStreak: number;
  longestStreak: number;
  likesGiven: number;
  likesReceived: number;
  trades: number;
  collectionSize: number;
  solutions: number;
  lastVisit: string | null;
  joinDate: string;
  profileComplete: boolean;
}

interface BadgeState {
  // User's earned badges
  earnedBadges: EarnedBadge[];

  // User stats for badge calculations
  userStats: UserStats;

  // Recently earned badges (for notifications)
  recentlyEarned: EarnedBadge[];

  // Actions
  checkAndAwardBadges: () => EarnedBadge[];
  awardBadge: (badgeId: string) => boolean;
  revokeBadge: (badgeId: string) => void;
  hasBadge: (badgeId: string) => boolean;
  getBadgeProgress: (badgeId: string) => number;

  // Stats updates
  incrementPosts: () => void;
  incrementThreads: () => void;
  incrementReplies: () => void;
  incrementLikesGiven: () => void;
  incrementLikesReceived: (count?: number) => void;
  incrementTrades: () => void;
  incrementCollectionSize: (count?: number) => void;
  incrementSolutions: () => void;
  recordVisit: () => void;
  setProfileComplete: (complete: boolean) => void;

  // Utility
  clearRecentlyEarned: () => void;
  getEarnedBadgeDetails: () => (Badge & { earnedAt: string })[];
  resetStats: () => void;
}

const DEFAULT_STATS: UserStats = {
  posts: 0,
  threads: 0,
  replies: 0,
  daysVisited: 0,
  currentStreak: 0,
  longestStreak: 0,
  likesGiven: 0,
  likesReceived: 0,
  trades: 0,
  collectionSize: 0,
  solutions: 0,
  lastVisit: null,
  joinDate: new Date().toISOString(),
  profileComplete: false,
};

export const useBadgeStore = create<BadgeState>()(
  persist(
    (set, get) => ({
      earnedBadges: [],
      userStats: DEFAULT_STATS,
      recentlyEarned: [],

      // Check all badges and award any that are newly earned
      checkAndAwardBadges: () => {
        const { userStats, earnedBadges, awardBadge } = get();
        const newlyEarned: EarnedBadge[] = [];
        const earnedIds = new Set(earnedBadges.map(b => b.badgeId));

        // Helper to check and award
        const checkBadge = (badge: Badge, currentValue: number) => {
          if (!earnedIds.has(badge.id) && currentValue >= badge.requirement.threshold) {
            if (awardBadge(badge.id)) {
              newlyEarned.push({
                badgeId: badge.id,
                earnedAt: new Date().toISOString(),
              });
            }
          }
        };

        // Check posting badges
        POSTING_BADGES.forEach(badge => {
          if (badge.requirement.type === 'posts') {
            checkBadge(badge, userStats.posts);
          }
        });

        // Check thread badges
        THREAD_BADGES.forEach(badge => {
          if (badge.requirement.type === 'threads') {
            checkBadge(badge, userStats.threads);
          }
        });

        // Check visiting badges
        VISITING_BADGES.forEach(badge => {
          if (badge.requirement.type === 'days_visited') {
            checkBadge(badge, userStats.daysVisited);
          }
        });

        // Check streak badges
        STREAK_BADGES.forEach(badge => {
          if (badge.requirement.type === 'streak') {
            checkBadge(badge, userStats.currentStreak);
          }
        });

        // Check engagement badges
        ENGAGEMENT_BADGES.forEach(badge => {
          if (badge.requirement.type === 'likes_given') {
            checkBadge(badge, userStats.likesGiven);
          } else if (badge.requirement.type === 'likes_received') {
            checkBadge(badge, userStats.likesReceived);
          }
        });

        // Check community badges
        COMMUNITY_BADGES.forEach(badge => {
          if (badge.requirement.type === 'replies') {
            checkBadge(badge, userStats.replies);
          }
        });

        // Award newcomer badge if not already earned
        if (!earnedIds.has('newcomer')) {
          awardBadge('newcomer');
          newlyEarned.push({
            badgeId: 'newcomer',
            earnedAt: new Date().toISOString(),
          });
        }

        // Check profile complete badge
        if (userStats.profileComplete && !earnedIds.has('profile_complete')) {
          awardBadge('profile_complete');
          newlyEarned.push({
            badgeId: 'profile_complete',
            earnedAt: new Date().toISOString(),
          });
        }

        // Update recently earned
        if (newlyEarned.length > 0) {
          set(state => ({
            recentlyEarned: [...state.recentlyEarned, ...newlyEarned],
          }));
        }

        return newlyEarned;
      },

      // Award a specific badge
      awardBadge: (badgeId: string) => {
        const badge = getBadgeById(badgeId);
        if (!badge) return false;

        const { earnedBadges } = get();
        if (earnedBadges.some(b => b.badgeId === badgeId)) {
          return false; // Already earned
        }

        const newBadge: EarnedBadge = {
          badgeId,
          earnedAt: new Date().toISOString(),
        };

        set(state => ({
          earnedBadges: [...state.earnedBadges, newBadge],
        }));

        return true;
      },

      // Revoke a badge (for special cases)
      revokeBadge: (badgeId: string) => {
        set(state => ({
          earnedBadges: state.earnedBadges.filter(b => b.badgeId !== badgeId),
        }));
      },

      // Check if user has a badge
      hasBadge: (badgeId: string) => {
        return get().earnedBadges.some(b => b.badgeId === badgeId);
      },

      // Get progress towards a badge (0-100)
      getBadgeProgress: (badgeId: string) => {
        const badge = getBadgeById(badgeId);
        if (!badge) return 0;

        const { userStats, hasBadge } = get();
        if (hasBadge(badgeId)) return 100;

        let currentValue = 0;
        switch (badge.requirement.type) {
          case 'posts':
            currentValue = userStats.posts;
            break;
          case 'threads':
            currentValue = userStats.threads;
            break;
          case 'days_visited':
            currentValue = userStats.daysVisited;
            break;
          case 'streak':
            currentValue = userStats.currentStreak;
            break;
          case 'likes_given':
            currentValue = userStats.likesGiven;
            break;
          case 'likes_received':
            currentValue = userStats.likesReceived;
            break;
          case 'replies':
            currentValue = userStats.replies;
            break;
          case 'trades':
            currentValue = userStats.trades;
            break;
          case 'collection':
            currentValue = userStats.collectionSize;
            break;
          default:
            return 0;
        }

        return Math.min(100, Math.round((currentValue / badge.requirement.threshold) * 100));
      },

      // Stat increment functions
      incrementPosts: () => {
        set(state => ({
          userStats: { ...state.userStats, posts: state.userStats.posts + 1 },
        }));
        get().checkAndAwardBadges();
      },

      incrementThreads: () => {
        set(state => ({
          userStats: { ...state.userStats, threads: state.userStats.threads + 1 },
        }));
        get().checkAndAwardBadges();
      },

      incrementReplies: () => {
        set(state => ({
          userStats: { ...state.userStats, replies: state.userStats.replies + 1 },
        }));
        get().checkAndAwardBadges();
      },

      incrementLikesGiven: () => {
        set(state => ({
          userStats: { ...state.userStats, likesGiven: state.userStats.likesGiven + 1 },
        }));
        get().checkAndAwardBadges();
      },

      incrementLikesReceived: (count = 1) => {
        set(state => ({
          userStats: { ...state.userStats, likesReceived: state.userStats.likesReceived + count },
        }));
        get().checkAndAwardBadges();
      },

      incrementTrades: () => {
        set(state => ({
          userStats: { ...state.userStats, trades: state.userStats.trades + 1 },
        }));
        get().checkAndAwardBadges();
      },

      incrementCollectionSize: (count = 1) => {
        set(state => ({
          userStats: { ...state.userStats, collectionSize: state.userStats.collectionSize + count },
        }));
        get().checkAndAwardBadges();
      },

      incrementSolutions: () => {
        set(state => ({
          userStats: { ...state.userStats, solutions: state.userStats.solutions + 1 },
        }));
        // Check helpful_trainer and mentor badges
        const { userStats, hasBadge, awardBadge } = get();
        if (userStats.solutions >= 1 && !hasBadge('helpful_trainer')) {
          awardBadge('helpful_trainer');
        }
        if (userStats.solutions >= 10 && !hasBadge('mentor')) {
          awardBadge('mentor');
        }
      },

      recordVisit: () => {
        const { userStats } = get();
        const today = new Date().toISOString().split('T')[0];
        const lastVisitDate = userStats.lastVisit?.split('T')[0];

        if (lastVisitDate === today) {
          return; // Already recorded today
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = userStats.currentStreak;
        let newLongestStreak = userStats.longestStreak;

        if (lastVisitDate === yesterdayStr) {
          // Continue streak
          newStreak += 1;
        } else if (lastVisitDate) {
          // Check for "went outside" badge (broke 50+ day streak)
          if (userStats.currentStreak >= 50 && !get().hasBadge('went_outside')) {
            get().awardBadge('went_outside');
          }
          // Reset streak
          newStreak = 1;
        } else {
          // First visit
          newStreak = 1;
        }

        if (newStreak > newLongestStreak) {
          newLongestStreak = newStreak;
        }

        set(state => ({
          userStats: {
            ...state.userStats,
            daysVisited: state.userStats.daysVisited + 1,
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastVisit: new Date().toISOString(),
          },
        }));

        get().checkAndAwardBadges();
      },

      setProfileComplete: (complete: boolean) => {
        set(state => ({
          userStats: { ...state.userStats, profileComplete: complete },
        }));
        if (complete) {
          get().checkAndAwardBadges();
        }
      },

      clearRecentlyEarned: () => {
        set({ recentlyEarned: [] });
      },

      getEarnedBadgeDetails: () => {
        const { earnedBadges } = get();
        return earnedBadges
          .map(earned => {
            const badge = getBadgeById(earned.badgeId);
            if (!badge) return null;
            return { ...badge, earnedAt: earned.earnedAt };
          })
          .filter((b): b is Badge & { earnedAt: string } => b !== null);
      },

      resetStats: () => {
        set({
          userStats: { ...DEFAULT_STATS, joinDate: new Date().toISOString() },
          earnedBadges: [],
          recentlyEarned: [],
        });
      },
    }),
    {
      name: 'tcg-forum-badges',
      partialize: (state) => ({
        earnedBadges: state.earnedBadges,
        userStats: state.userStats,
      }),
    }
  )
);

// Hook to get badge notification count
export function useNewBadgeCount(): number {
  return useBadgeStore(state => state.recentlyEarned.length);
}
