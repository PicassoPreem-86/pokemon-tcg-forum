// TCG Gossip - Consolidated Multi-Game Categories (9 total)
export interface Subcategory {
  id: string;
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  threadCount: number;
  postCount: number;
  subcategories?: Subcategory[];
}

export const CATEGORIES: Category[] = [
  // ============================================
  // UNIVERSAL CATEGORIES (All TCGs) - 5 total
  // ============================================
  {
    id: 'collecting',
    slug: 'collecting',
    name: 'Collecting & Showcases',
    description: 'Show off your collection from any TCG - Pokemon, One Piece, and more',
    color: '#F59E0B',
    icon: 'Star',
    threadCount: 3847,
    postCount: 67892,
  },
  {
    id: 'market',
    slug: 'market',
    name: 'Market & Prices',
    description: 'Price checks, market trends, and investment discussion across all TCGs',
    color: '#06B6D4',
    icon: 'TrendingUp',
    threadCount: 2156,
    postCount: 34567,
  },
  {
    id: 'grading',
    slug: 'grading',
    name: 'Grading & Authentication',
    description: 'PSA, BGS, CGC grading help and card authentication for all games',
    color: '#8B5CF6',
    icon: 'Award',
    threadCount: 1890,
    postCount: 28945,
  },
  {
    id: 'pulls',
    slug: 'pulls',
    name: 'Pulls & Pack Openings',
    description: 'Share your best pulls and pack opening experiences from any TCG',
    color: '#10B981',
    icon: 'Package',
    threadCount: 4521,
    postCount: 89234,
  },
  {
    id: 'news',
    slug: 'news',
    name: 'TCG News & Updates',
    description: 'Latest news, set releases, and announcements from all trading card games',
    color: '#3B82F6',
    icon: 'Newspaper',
    threadCount: 892,
    postCount: 45678,
  },

  // ============================================
  // POKEMON TCG SPECIFIC - 2 total
  // ============================================
  {
    id: 'pokemon-general',
    slug: 'pokemon-general',
    name: 'Pokemon - General Discussion',
    description: 'Chat about anything Pokemon TCG related',
    color: '#EC4899',
    icon: 'MessageSquare',
    threadCount: 5234,
    postCount: 123456,
  },
  {
    id: 'pokemon-competitive',
    slug: 'pokemon-competitive',
    name: 'Pokemon - Competitive Play',
    description: 'Deck building, strategies, meta discussion, and tournament prep',
    color: '#FFCB05',
    icon: 'Trophy',
    threadCount: 3456,
    postCount: 78901,
  },

  // ============================================
  // ONE PIECE TCG SPECIFIC - 2 total
  // ============================================
  {
    id: 'op-general',
    slug: 'op-general',
    name: 'One Piece - General Discussion',
    description: 'Chat about anything One Piece TCG related',
    color: '#FF6B35',
    icon: 'MessageSquare',
    threadCount: 2341,
    postCount: 45678,
  },
  {
    id: 'op-deck-building',
    slug: 'op-deck-building',
    name: 'One Piece - Deck Building',
    description: 'Deck lists, leader strategies, and competitive One Piece play',
    color: '#4ECDC4',
    icon: 'Layers',
    threadCount: 1567,
    postCount: 23456,
  },
];

// Latest Threads Mock Data
export interface Thread {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  category: string;
  categoryColor: string;
  replyCount: number;
  viewCount: number;
  lastActivity: string;
  isPinned?: boolean;
  isHot?: boolean;
  slug?: string; // Optional slug for linking to thread page
}

export const LATEST_THREADS: Thread[] = [
  {
    id: '1',
    title: 'Prismatic Evolutions - Full Set List Revealed!',
    author: 'PikachuMaster',
    authorAvatar: '/images/pokemon/pikachu.png',
    category: 'News',
    categoryColor: '#EC4899',
    replyCount: 234,
    viewCount: 8923,
    lastActivity: '2 min ago',
    isPinned: true,
  },
  {
    id: '2',
    title: 'My complete Base Set collection - finally done!',
    author: 'VintageCollector',
    authorAvatar: '/images/pokemon/charizard.png',
    category: 'Collecting',
    categoryColor: '#10B981',
    replyCount: 89,
    viewCount: 2341,
    lastActivity: '15 min ago',
    isHot: true,
  },
  {
    id: '3',
    title: 'PSA vs CGC - Which grading service is better in 2024?',
    author: 'GradeHunter',
    authorAvatar: '/images/pokemon/mewtwo.png',
    category: 'Grading',
    categoryColor: '#EF4444',
    replyCount: 156,
    viewCount: 5678,
    lastActivity: '32 min ago',
  },
  {
    id: '4',
    title: '[H] Alt Arts, Secret Rares [W] PayPal or Trades',
    author: 'CardTrader99',
    authorAvatar: '/images/pokemon/eevee.png',
    category: 'Buy & Trade',
    categoryColor: '#06B6D4',
    replyCount: 45,
    viewCount: 1234,
    lastActivity: '1 hour ago',
  },
  {
    id: '5',
    title: 'Charizard ex market analysis - why prices are rising',
    author: 'MarketWatcher',
    authorAvatar: '/images/pokemon/gengar.png',
    category: 'Market',
    categoryColor: '#F59E0B',
    replyCount: 78,
    viewCount: 3456,
    lastActivity: '2 hours ago',
  },
  {
    id: '6',
    title: 'Best budget deck for local tournaments?',
    author: 'NewPlayer2024',
    authorAvatar: '/images/pokemon/snorlax.png',
    category: 'General',
    categoryColor: '#6366F1',
    replyCount: 92,
    viewCount: 2890,
    lastActivity: '3 hours ago',
  },
  {
    id: '7',
    title: 'Complete Guide: How to spot fake Pokemon cards',
    author: 'AuthenticityPro',
    authorAvatar: '/images/pokemon/pikachu.png',
    category: 'Articles',
    categoryColor: '#8B5CF6',
    replyCount: 234,
    viewCount: 12456,
    lastActivity: '4 hours ago',
    isHot: true,
  },
  {
    id: '8',
    title: 'TCG Pocket: Best decks for ranked ladder',
    author: 'PocketMaster',
    authorAvatar: '/images/pokemon/mewtwo.png',
    category: 'General',
    categoryColor: '#6366F1',
    replyCount: 167,
    viewCount: 7823,
    lastActivity: '5 hours ago',
  },
];

// Forum Statistics
export const FORUM_STATS = {
  totalMembers: 45678,
  totalThreads: 23456,
  totalPosts: 456789,
  onlineNow: 1234,
  newestMember: 'PikachuFan2024',
};

// Online Users Mock
export const ONLINE_USERS = [
  'PikachuMaster',
  'VintageCollector',
  'CardTrader99',
  'GradeHunter',
  'MarketWatcher',
  'NewPlayer2024',
  'PocketMaster',
  'AuthenticityPro',
];

// Helper function to format numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// Get category by slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(cat => cat.slug === slug);
}
