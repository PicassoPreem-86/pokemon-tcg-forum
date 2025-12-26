// Pokemon TCG Forum Badge System
// Inspired by Elite Four's comprehensive badge system

export type BadgeCategory =
  | 'posting'
  | 'visiting'
  | 'engagement'
  | 'content'
  | 'community'
  | 'special'
  | 'trading';

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  color: string;
  requirement: BadgeRequirement;
  usersEarned?: number;
}

export interface BadgeRequirement {
  type: 'posts' | 'threads' | 'days_visited' | 'streak' | 'likes_given' | 'likes_received' |
        'replies' | 'views' | 'shares' | 'first' | 'special' | 'trades' | 'collection';
  threshold: number;
  description: string;
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
  progress?: number; // For progressive badges
}

// Badge color palette matching Pokemon types
const BADGE_COLORS = {
  common: '#78C850',      // Grass - green
  uncommon: '#6890F0',    // Water - blue
  rare: '#A040A0',        // Poison - purple
  epic: '#F08030',        // Fire - orange
  legendary: '#F8D030',   // Electric - yellow/gold
};

// =====================================
// POSTING BADGES - Based on post count
// =====================================
export const POSTING_BADGES: Badge[] = [
  {
    id: 'rattata_runner',
    name: 'Rattata Runner',
    description: 'Your first steps in the forum world',
    icon: '🐭',
    category: 'posting',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'posts', threshold: 1, description: 'Create your first post' },
    usersEarned: 0,
  },
  {
    id: 'pidgey_poster',
    name: 'Pidgey Poster',
    description: 'Taking flight with 10 posts',
    icon: '🐦',
    category: 'posting',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'posts', threshold: 10, description: 'Create 10 posts' },
    usersEarned: 0,
  },
  {
    id: 'pikachu_powerhouse',
    name: 'Pikachu Powerhouse',
    description: 'Shocking the community with 50 posts',
    icon: '⚡',
    category: 'posting',
    rarity: 'uncommon',
    color: BADGE_COLORS.uncommon,
    requirement: { type: 'posts', threshold: 50, description: 'Create 50 posts' },
    usersEarned: 0,
  },
  {
    id: 'charizard_contributor',
    name: 'Charizard Contributor',
    description: 'Blazing through 100 posts',
    icon: '🔥',
    category: 'posting',
    rarity: 'uncommon',
    color: BADGE_COLORS.uncommon,
    requirement: { type: 'posts', threshold: 100, description: 'Create 100 posts' },
    usersEarned: 0,
  },
  {
    id: 'dragonite_debater',
    name: 'Dragonite Debater',
    description: 'Soaring with 250 posts',
    icon: '🐲',
    category: 'posting',
    rarity: 'rare',
    color: BADGE_COLORS.rare,
    requirement: { type: 'posts', threshold: 250, description: 'Create 250 posts' },
    usersEarned: 0,
  },
  {
    id: 'mewtwo_master',
    name: 'Mewtwo Master',
    description: 'Legendary status with 500 posts',
    icon: '🧬',
    category: 'posting',
    rarity: 'rare',
    color: BADGE_COLORS.rare,
    requirement: { type: 'posts', threshold: 500, description: 'Create 500 posts' },
    usersEarned: 0,
  },
  {
    id: 'rayquaza_regular',
    name: 'Rayquaza Regular',
    description: 'Ruling the skies with 1,000 posts',
    icon: '🌟',
    category: 'posting',
    rarity: 'epic',
    color: BADGE_COLORS.epic,
    requirement: { type: 'posts', threshold: 1000, description: 'Create 1,000 posts' },
    usersEarned: 0,
  },
  {
    id: 'arceus_authority',
    name: 'Arceus Authority',
    description: 'God-tier poster with 2,500 posts',
    icon: '👑',
    category: 'posting',
    rarity: 'epic',
    color: BADGE_COLORS.epic,
    requirement: { type: 'posts', threshold: 2500, description: 'Create 2,500 posts' },
    usersEarned: 0,
  },
  {
    id: 'elite_four_legend',
    name: 'Elite Four Legend',
    description: 'The ultimate achievement - 4,444 posts',
    icon: '🏆',
    category: 'posting',
    rarity: 'legendary',
    color: BADGE_COLORS.legendary,
    requirement: { type: 'posts', threshold: 4444, description: 'Create 4,444 posts' },
    usersEarned: 0,
  },
];

// =====================================
// THREAD BADGES - Based on threads created
// =====================================
export const THREAD_BADGES: Badge[] = [
  {
    id: 'conversation_starter',
    name: 'Conversation Starter',
    description: 'Started your first discussion',
    icon: '💬',
    category: 'posting',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'threads', threshold: 1, description: 'Create your first thread' },
    usersEarned: 0,
  },
  {
    id: 'topic_trainer',
    name: 'Topic Trainer',
    description: 'Created 5 discussion threads',
    icon: '📝',
    category: 'posting',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'threads', threshold: 5, description: 'Create 5 threads' },
    usersEarned: 0,
  },
  {
    id: 'thread_weaver',
    name: 'Thread Weaver',
    description: 'Spinning discussions with 25 threads',
    icon: '🕸️',
    category: 'posting',
    rarity: 'uncommon',
    color: BADGE_COLORS.uncommon,
    requirement: { type: 'threads', threshold: 25, description: 'Create 25 threads' },
    usersEarned: 0,
  },
  {
    id: 'discussion_dynamo',
    name: 'Discussion Dynamo',
    description: 'Powerhouse with 50 threads created',
    icon: '🌀',
    category: 'posting',
    rarity: 'rare',
    color: BADGE_COLORS.rare,
    requirement: { type: 'threads', threshold: 50, description: 'Create 50 threads' },
    usersEarned: 0,
  },
];

// =====================================
// VISITING BADGES - Based on site visits
// =====================================
export const VISITING_BADGES: Badge[] = [
  {
    id: 'pokecenter_visitor',
    name: 'PokeCenter Visitor',
    description: 'Visited the forum for 7 days',
    icon: '🏥',
    category: 'visiting',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'days_visited', threshold: 7, description: 'Visit for 7 days' },
    usersEarned: 0,
  },
  {
    id: 'gym_regular',
    name: 'Gym Regular',
    description: 'Visited for 30 days total',
    icon: '🏟️',
    category: 'visiting',
    rarity: 'uncommon',
    color: BADGE_COLORS.uncommon,
    requirement: { type: 'days_visited', threshold: 30, description: 'Visit for 30 days' },
    usersEarned: 0,
  },
  {
    id: 'pokemon_league_regular',
    name: 'Pokemon League Regular',
    description: 'A true regular with 100 days visited',
    icon: '🏛️',
    category: 'visiting',
    rarity: 'rare',
    color: BADGE_COLORS.rare,
    requirement: { type: 'days_visited', threshold: 100, description: 'Visit for 100 days' },
    usersEarned: 0,
  },
  {
    id: 'hall_of_fame',
    name: 'Hall of Fame',
    description: 'Legendary dedication - 365 days visited',
    icon: '🏆',
    category: 'visiting',
    rarity: 'legendary',
    color: BADGE_COLORS.legendary,
    requirement: { type: 'days_visited', threshold: 365, description: 'Visit for 365 days' },
    usersEarned: 0,
  },
];

// =====================================
// STREAK BADGES - Consecutive day visits
// =====================================
export const STREAK_BADGES: Badge[] = [
  {
    id: 'dedicated_trainer',
    name: 'Dedicated Trainer',
    description: 'Visited 7 days in a row',
    icon: '📅',
    category: 'visiting',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'streak', threshold: 7, description: '7-day login streak' },
    usersEarned: 0,
  },
  {
    id: 'monthly_master',
    name: 'Monthly Master',
    description: 'Incredible 30-day streak',
    icon: '🗓️',
    category: 'visiting',
    rarity: 'uncommon',
    color: BADGE_COLORS.uncommon,
    requirement: { type: 'streak', threshold: 30, description: '30-day login streak' },
    usersEarned: 0,
  },
  {
    id: 'touch_grass',
    name: 'Touch Grass',
    description: 'Maybe take a break? 100-day streak!',
    icon: '🌿',
    category: 'visiting',
    rarity: 'rare',
    color: BADGE_COLORS.rare,
    requirement: { type: 'streak', threshold: 100, description: '100-day login streak' },
    usersEarned: 0,
  },
  {
    id: 'no_life',
    name: 'No Life (Affectionate)',
    description: 'You REALLY love this forum - 365-day streak',
    icon: '🎮',
    category: 'visiting',
    rarity: 'legendary',
    color: BADGE_COLORS.legendary,
    requirement: { type: 'streak', threshold: 365, description: '365-day login streak' },
    usersEarned: 0,
  },
  {
    id: 'went_outside',
    name: 'Went Outside',
    description: 'Broke a 50+ day streak (good for you!)',
    icon: '🌳',
    category: 'visiting',
    rarity: 'uncommon',
    color: '#22c55e',
    requirement: { type: 'special', threshold: 50, description: 'Break a 50+ day streak' },
    usersEarned: 0,
  },
];

// =====================================
// ENGAGEMENT BADGES - Likes given/received
// =====================================
export const ENGAGEMENT_BADGES: Badge[] = [
  // Likes Given
  {
    id: 'friendly_trainer',
    name: 'Friendly Trainer',
    description: 'Given 10 likes to others',
    icon: '👍',
    category: 'engagement',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'likes_given', threshold: 10, description: 'Give 10 likes' },
    usersEarned: 0,
  },
  {
    id: 'generous_soul',
    name: 'Generous Soul',
    description: 'Shared the love with 100 likes',
    icon: '💝',
    category: 'engagement',
    rarity: 'uncommon',
    color: BADGE_COLORS.uncommon,
    requirement: { type: 'likes_given', threshold: 100, description: 'Give 100 likes' },
    usersEarned: 0,
  },
  {
    id: 'like_machine',
    name: 'Like Machine',
    description: 'Spreading joy with 500 likes given',
    icon: '❤️‍🔥',
    category: 'engagement',
    rarity: 'rare',
    color: BADGE_COLORS.rare,
    requirement: { type: 'likes_given', threshold: 500, description: 'Give 500 likes' },
    usersEarned: 0,
  },
  {
    id: 'heart_of_gold',
    name: 'Heart of Gold',
    description: 'Ultimate supporter - 1,000 likes given',
    icon: '💛',
    category: 'engagement',
    rarity: 'epic',
    color: BADGE_COLORS.epic,
    requirement: { type: 'likes_given', threshold: 1000, description: 'Give 1,000 likes' },
    usersEarned: 0,
  },
  // Likes Received
  {
    id: 'first_like',
    name: 'First Like',
    description: 'Received your first like',
    icon: '🌟',
    category: 'engagement',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'likes_received', threshold: 1, description: 'Receive 1 like' },
    usersEarned: 0,
  },
  {
    id: 'crowd_pleaser',
    name: 'Crowd Pleaser',
    description: 'Your posts earned 50 likes',
    icon: '🎉',
    category: 'engagement',
    rarity: 'uncommon',
    color: BADGE_COLORS.uncommon,
    requirement: { type: 'likes_received', threshold: 50, description: 'Receive 50 likes' },
    usersEarned: 0,
  },
  {
    id: 'fan_favorite',
    name: 'Fan Favorite',
    description: 'Community loves you - 250 likes received',
    icon: '⭐',
    category: 'engagement',
    rarity: 'rare',
    color: BADGE_COLORS.rare,
    requirement: { type: 'likes_received', threshold: 250, description: 'Receive 250 likes' },
    usersEarned: 0,
  },
  {
    id: 'celebrity_status',
    name: 'Celebrity Status',
    description: 'Forum famous with 1,000 likes received',
    icon: '🌠',
    category: 'engagement',
    rarity: 'epic',
    color: BADGE_COLORS.epic,
    requirement: { type: 'likes_received', threshold: 1000, description: 'Receive 1,000 likes' },
    usersEarned: 0,
  },
  {
    id: 'legendary_contributor',
    name: 'Legendary Contributor',
    description: 'Icon status - 5,000 likes received',
    icon: '👑',
    category: 'engagement',
    rarity: 'legendary',
    color: BADGE_COLORS.legendary,
    requirement: { type: 'likes_received', threshold: 5000, description: 'Receive 5,000 likes' },
    usersEarned: 0,
  },
];

// =====================================
// COMMUNITY BADGES - First actions
// =====================================
export const COMMUNITY_BADGES: Badge[] = [
  {
    id: 'newcomer',
    name: 'Newcomer',
    description: 'Welcome to TCG Gossip!',
    icon: '🎒',
    category: 'community',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'first', threshold: 1, description: 'Join the forum' },
    usersEarned: 0,
  },
  {
    id: 'profile_complete',
    name: 'Profile Complete',
    description: 'Filled out your trainer card',
    icon: '📇',
    category: 'community',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'special', threshold: 1, description: 'Complete your profile' },
    usersEarned: 0,
  },
  {
    id: 'first_reply',
    name: 'First Reply',
    description: 'Joined the conversation',
    icon: '💭',
    category: 'community',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'replies', threshold: 1, description: 'Post your first reply' },
    usersEarned: 0,
  },
  {
    id: 'helpful_trainer',
    name: 'Helpful Trainer',
    description: 'Had a post marked as solution',
    icon: '✅',
    category: 'community',
    rarity: 'uncommon',
    color: BADGE_COLORS.uncommon,
    requirement: { type: 'special', threshold: 1, description: 'Have a post marked as solution' },
    usersEarned: 0,
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Provided 10 helpful solutions',
    icon: '🎓',
    category: 'community',
    rarity: 'rare',
    color: BADGE_COLORS.rare,
    requirement: { type: 'special', threshold: 10, description: 'Provide 10 solutions' },
    usersEarned: 0,
  },
];

// =====================================
// TRADING BADGES - For buy/sell/trade
// =====================================
export const TRADING_BADGES: Badge[] = [
  {
    id: 'first_trade',
    name: 'First Trade',
    description: 'Completed your first trade',
    icon: '🤝',
    category: 'trading',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'trades', threshold: 1, description: 'Complete 1 trade' },
    usersEarned: 0,
  },
  {
    id: 'trusted_trader',
    name: 'Trusted Trader',
    description: 'Completed 10 successful trades',
    icon: '⭐',
    category: 'trading',
    rarity: 'uncommon',
    color: BADGE_COLORS.uncommon,
    requirement: { type: 'trades', threshold: 10, description: 'Complete 10 trades' },
    usersEarned: 0,
  },
  {
    id: 'master_trader',
    name: 'Master Trader',
    description: 'Trading legend with 50 trades',
    icon: '💎',
    category: 'trading',
    rarity: 'rare',
    color: BADGE_COLORS.rare,
    requirement: { type: 'trades', threshold: 50, description: 'Complete 50 trades' },
    usersEarned: 0,
  },
  {
    id: 'collector_showcase',
    name: 'Collector Showcase',
    description: 'Added 10 cards to your collection',
    icon: '📚',
    category: 'trading',
    rarity: 'common',
    color: BADGE_COLORS.common,
    requirement: { type: 'collection', threshold: 10, description: 'Add 10 cards to collection' },
    usersEarned: 0,
  },
  {
    id: 'master_collector',
    name: 'Master Collector',
    description: 'Impressive collection of 100 cards',
    icon: '🏛️',
    category: 'trading',
    rarity: 'rare',
    color: BADGE_COLORS.rare,
    requirement: { type: 'collection', threshold: 100, description: 'Add 100 cards to collection' },
    usersEarned: 0,
  },
];

// =====================================
// SPECIAL BADGES - Event/Holiday badges
// =====================================
export const SPECIAL_BADGES: Badge[] = [
  {
    id: 'founding_member',
    name: 'Founding Member',
    description: 'Joined during the forum launch period',
    icon: '🎖️',
    category: 'special',
    rarity: 'legendary',
    color: BADGE_COLORS.legendary,
    requirement: { type: 'special', threshold: 1, description: 'Join during launch' },
    usersEarned: 0,
  },
  {
    id: 'holiday_spirit_2024',
    name: 'Holiday Spirit 2024',
    description: 'Active during the 2024 holiday season',
    icon: '🎄',
    category: 'special',
    rarity: 'uncommon',
    color: '#22c55e',
    requirement: { type: 'special', threshold: 1, description: 'Participate in holiday event' },
    usersEarned: 0,
  },
  {
    id: 'pokemon_day_2025',
    name: 'Pokemon Day 2025',
    description: 'Celebrated Pokemon Day 2025',
    icon: '🎂',
    category: 'special',
    rarity: 'rare',
    color: BADGE_COLORS.rare,
    requirement: { type: 'special', threshold: 1, description: 'Active on Pokemon Day' },
    usersEarned: 0,
  },
  {
    id: 'bug_catcher',
    name: 'Bug Catcher',
    description: 'Reported a bug that was fixed',
    icon: '🐛',
    category: 'special',
    rarity: 'rare',
    color: '#a3e635',
    requirement: { type: 'special', threshold: 1, description: 'Report a valid bug' },
    usersEarned: 0,
  },
  {
    id: 'content_creator',
    name: 'Content Creator',
    description: 'Created featured content',
    icon: '🎬',
    category: 'special',
    rarity: 'epic',
    color: BADGE_COLORS.epic,
    requirement: { type: 'special', threshold: 1, description: 'Have content featured' },
    usersEarned: 0,
  },
];

// =====================================
// ALL BADGES COMBINED
// =====================================
export const ALL_BADGES: Badge[] = [
  ...POSTING_BADGES,
  ...THREAD_BADGES,
  ...VISITING_BADGES,
  ...STREAK_BADGES,
  ...ENGAGEMENT_BADGES,
  ...COMMUNITY_BADGES,
  ...TRADING_BADGES,
  ...SPECIAL_BADGES,
];

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Get a badge by ID
 */
export function getBadgeById(badgeId: string): Badge | undefined {
  return ALL_BADGES.find(badge => badge.id === badgeId);
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return ALL_BADGES.filter(badge => badge.category === category);
}

/**
 * Get badges by rarity
 */
export function getBadgesByRarity(rarity: BadgeRarity): Badge[] {
  return ALL_BADGES.filter(badge => badge.rarity === rarity);
}

/**
 * Category display names and icons
 */
export const BADGE_CATEGORIES: { id: BadgeCategory; name: string; icon: string; description: string }[] = [
  { id: 'posting', name: 'Posting', icon: '📝', description: 'Earned by creating posts and threads' },
  { id: 'visiting', name: 'Visiting', icon: '📅', description: 'Earned by visiting the forum regularly' },
  { id: 'engagement', name: 'Engagement', icon: '❤️', description: 'Earned by giving and receiving likes' },
  { id: 'community', name: 'Community', icon: '👥', description: 'Earned by participating in the community' },
  { id: 'trading', name: 'Trading', icon: '🤝', description: 'Earned by trading and collecting cards' },
  { id: 'special', name: 'Special', icon: '✨', description: 'Limited edition and event badges' },
];

/**
 * Rarity sort order (for display)
 */
export const RARITY_ORDER: BadgeRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

/**
 * Rarity display info
 */
export const RARITY_INFO: Record<BadgeRarity, { name: string; color: string }> = {
  common: { name: 'Common', color: BADGE_COLORS.common },
  uncommon: { name: 'Uncommon', color: BADGE_COLORS.uncommon },
  rare: { name: 'Rare', color: BADGE_COLORS.rare },
  epic: { name: 'Epic', color: BADGE_COLORS.epic },
  legendary: { name: 'Legendary', color: BADGE_COLORS.legendary },
};
