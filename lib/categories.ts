// Elite Fourum Style Categories - Pokemon TCG Theme
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
  {
    id: 'general',
    slug: 'general',
    name: 'General',
    description: 'General discussion about Pokemon TCG and the community',
    color: '#6366F1',
    icon: 'MessageSquare',
    threadCount: 4523,
    postCount: 89234,
    subcategories: [
      { id: 'general-intro', name: 'Introductions', description: 'New member introductions' },
      { id: 'general-offtopic', name: 'Off-Topic', description: 'Non-Pokemon discussions' },
      { id: 'general-feedback', name: 'Site Feedback', description: 'Suggestions and feedback' },
    ],
  },
  {
    id: 'collecting',
    slug: 'collecting',
    name: 'Collecting',
    description: 'Card collections, pulls, and showcase your binders',
    color: '#10B981',
    icon: 'Star',
    threadCount: 3847,
    postCount: 67892,
  },
  {
    id: 'market',
    slug: 'market',
    name: 'Market',
    description: 'Price checks, market trends, and investment discussion',
    color: '#F59E0B',
    icon: 'TrendingUp',
    threadCount: 2156,
    postCount: 34567,
    subcategories: [
      { id: 'market-prices', name: 'Price Checks', description: 'Get valuations on your cards' },
      { id: 'market-trends', name: 'Market Trends', description: 'Discussion of market movements' },
      { id: 'market-invest', name: 'Investment', description: 'Long-term card investments' },
    ],
  },
  {
    id: 'grading',
    slug: 'grading',
    name: 'Grading',
    description: 'PSA, CGC, BGS - grading services and submissions',
    color: '#EF4444',
    icon: 'Award',
    threadCount: 1890,
    postCount: 28945,
  },
  {
    id: 'articles',
    slug: 'articles',
    name: 'Articles',
    description: 'In-depth guides, tutorials, and community content',
    color: '#8B5CF6',
    icon: 'BookOpen',
    threadCount: 567,
    postCount: 12345,
  },
  {
    id: 'news',
    slug: 'news',
    name: 'News & Links',
    description: 'Latest Pokemon TCG news, set reveals, and announcements',
    color: '#EC4899',
    icon: 'Newspaper',
    threadCount: 892,
    postCount: 45678,
  },
  {
    id: 'trade',
    slug: 'buy-trade',
    name: 'Buy & Trade',
    description: 'Buy, sell, and trade Pokemon cards with the community',
    color: '#06B6D4',
    icon: 'ArrowLeftRight',
    threadCount: 5678,
    postCount: 123456,
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
