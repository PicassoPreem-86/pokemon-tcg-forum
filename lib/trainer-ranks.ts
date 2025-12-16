// Trainer Rank System for Pokemon TCG Forum
export type TrainerRank = 'beginner' | 'pokemon_trainer' | 'ace_trainer' | 'pokemon_master' | 'champion';

export interface TrainerRankData {
  id: TrainerRank;
  name: string;
  minPosts: number;
  color: string;
  icon: string;
}

export const TRAINER_RANKS: TrainerRankData[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    minPosts: 0,
    color: '#10B981',
    icon: 'Sparkles',
  },
  {
    id: 'pokemon_trainer',
    name: 'Pokemon Trainer',
    minPosts: 50,
    color: '#3B82F6',
    icon: 'User',
  },
  {
    id: 'ace_trainer',
    name: 'Ace Trainer',
    minPosts: 500,
    color: '#8B5CF6',
    icon: 'Star',
  },
  {
    id: 'pokemon_master',
    name: 'Pokemon Master',
    minPosts: 2000,
    color: '#F59E0B',
    icon: 'Crown',
  },
  {
    id: 'champion',
    name: 'Champion',
    minPosts: 10000,
    color: '#FFCC00',
    icon: 'Trophy',
  },
];

/**
 * Get the trainer rank based on post count
 */
export function getTrainerRank(postCount: number): TrainerRankData {
  // Find the highest rank the user qualifies for
  const ranks = [...TRAINER_RANKS].reverse(); // Start from highest rank
  const rank = ranks.find(r => postCount >= r.minPosts);
  return rank || TRAINER_RANKS[0]; // Default to beginner if no match
}

/**
 * Get progress to next rank
 * Returns { current, next, progress, postsNeeded }
 */
export function getProgressToNextRank(postCount: number) {
  const currentRank = getTrainerRank(postCount);
  const currentRankIndex = TRAINER_RANKS.findIndex(r => r.id === currentRank.id);

  // If already at max rank
  if (currentRankIndex === TRAINER_RANKS.length - 1) {
    return {
      current: currentRank,
      next: null,
      progress: 100,
      postsNeeded: 0,
    };
  }

  const nextRank = TRAINER_RANKS[currentRankIndex + 1];
  const postsInCurrentRank = postCount - currentRank.minPosts;
  const postsNeededForNext = nextRank.minPosts - currentRank.minPosts;
  const progress = Math.min(100, (postsInCurrentRank / postsNeededForNext) * 100);
  const postsNeeded = nextRank.minPosts - postCount;

  return {
    current: currentRank,
    next: nextRank,
    progress: Math.round(progress),
    postsNeeded: Math.max(0, postsNeeded),
  };
}
