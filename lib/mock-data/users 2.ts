// Mock User Data for Pokemon TCG Forum
export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  joinDate: string;
  postCount: number;
  reputation: number;
  isOnline: boolean;
  role: 'admin' | 'moderator' | 'vip' | 'member';
  badges: UserBadge[];
  location?: string;
  bio?: string;
}

export const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'PikachuMaster',
    displayName: 'Pikachu Master',
    avatar: '/images/pokemon/pikachu.png',
    joinDate: '2022-01-15',
    postCount: 12456,
    reputation: 8923,
    isOnline: true,
    role: 'admin',
    location: 'Viridian City',
    bio: 'Passionate Pokemon TCG collector and competitive player. Specializing in Electric-type decks!',
    badges: [
      {
        id: 'founder',
        name: 'Founder',
        icon: 'Crown',
        color: '#FFCC00',
        description: 'Forum Founder',
      },
      {
        id: 'verified',
        name: 'Verified',
        icon: 'CheckCircle',
        color: '#3B82F6',
        description: 'Verified Collector',
      },
      {
        id: 'top_contributor',
        name: 'Top Contributor',
        icon: 'Star',
        color: '#F59E0B',
        description: 'Top 1% Contributor',
      },
    ],
  },
  {
    id: '2',
    username: 'VintageCollector',
    displayName: 'Vintage Collector',
    avatar: '/images/pokemon/charizard.png',
    joinDate: '2022-03-22',
    postCount: 8234,
    reputation: 6721,
    isOnline: true,
    role: 'moderator',
    location: 'Pallet Town',
    bio: 'WOTC era collector. Base Set, Jungle, Fossil - those were the days!',
    badges: [
      {
        id: 'moderator',
        name: 'Moderator',
        icon: 'Shield',
        color: '#10B981',
        description: 'Community Moderator',
      },
      {
        id: 'vintage_expert',
        name: 'Vintage Expert',
        icon: 'Award',
        color: '#8B5CF6',
        description: 'WOTC Era Specialist',
      },
      {
        id: 'helpful',
        name: 'Helpful',
        icon: 'Heart',
        color: '#EF4444',
        description: '1000+ Helpful Posts',
      },
    ],
  },
  {
    id: '3',
    username: 'GradeHunter',
    displayName: 'Grade Hunter',
    avatar: '/images/pokemon/mewtwo.png',
    joinDate: '2023-06-10',
    postCount: 3456,
    reputation: 4521,
    isOnline: false,
    role: 'vip',
    location: 'Cerulean Cave',
    bio: 'PSA 10 or bust! Grading enthusiast and submission expert.',
    badges: [
      {
        id: 'vip',
        name: 'VIP',
        icon: 'Gem',
        color: '#EC4899',
        description: 'VIP Member',
      },
      {
        id: 'grading_expert',
        name: 'Grading Expert',
        icon: 'Award',
        color: '#EF4444',
        description: 'Grading Specialist',
      },
    ],
  },
  {
    id: '4',
    username: 'CardTrader99',
    displayName: 'Card Trader 99',
    avatar: '/images/pokemon/eevee.png',
    joinDate: '2023-02-14',
    postCount: 1892,
    reputation: 2341,
    isOnline: true,
    role: 'member',
    location: 'Celadon City',
    bio: 'Always looking for trades! Check out my trade thread.',
    badges: [
      {
        id: 'trusted_trader',
        name: 'Trusted Trader',
        icon: 'ArrowLeftRight',
        color: '#06B6D4',
        description: '100+ Successful Trades',
      },
      {
        id: 'active',
        name: 'Active Member',
        icon: 'Zap',
        color: '#FFCC00',
        description: 'Daily Active User',
      },
    ],
  },
  {
    id: '5',
    username: 'MarketWatcher',
    displayName: 'Market Watcher',
    avatar: '/images/pokemon/gengar.png',
    joinDate: '2022-08-05',
    postCount: 5678,
    reputation: 5234,
    isOnline: false,
    role: 'member',
    location: 'Lavender Town',
    bio: 'Tracking market trends and investment opportunities in Pokemon TCG.',
    badges: [
      {
        id: 'analyst',
        name: 'Market Analyst',
        icon: 'TrendingUp',
        color: '#F59E0B',
        description: 'Market Analysis Expert',
      },
      {
        id: 'veteran',
        name: 'Veteran',
        icon: 'Shield',
        color: '#8B5CF6',
        description: '2+ Years Member',
      },
    ],
  },
  {
    id: '6',
    username: 'NewPlayer2024',
    displayName: 'New Player 2024',
    avatar: '/images/pokemon/snorlax.png',
    joinDate: '2024-01-10',
    postCount: 234,
    reputation: 156,
    isOnline: true,
    role: 'member',
    location: 'Route 12',
    bio: 'Just getting started with Pokemon TCG! Learning the ropes.',
    badges: [
      {
        id: 'newcomer',
        name: 'Newcomer',
        icon: 'Sparkles',
        color: '#10B981',
        description: 'Welcome to the community!',
      },
    ],
  },
  {
    id: '7',
    username: 'PocketMaster',
    displayName: 'Pocket Master',
    avatar: '/images/pokemon/mewtwo.png',
    joinDate: '2023-11-20',
    postCount: 892,
    reputation: 1234,
    isOnline: false,
    role: 'member',
    location: 'Digital Realm',
    bio: 'TCG Pocket enthusiast and mobile game strategist.',
    badges: [
      {
        id: 'pocket_pro',
        name: 'Pocket Pro',
        icon: 'Smartphone',
        color: '#3B82F6',
        description: 'TCG Pocket Expert',
      },
      {
        id: 'strategist',
        name: 'Strategist',
        icon: 'Brain',
        color: '#8B5CF6',
        description: 'Deck Building Specialist',
      },
    ],
  },
  {
    id: '8',
    username: 'AuthenticityPro',
    displayName: 'Authenticity Pro',
    avatar: '/images/pokemon/pikachu.png',
    joinDate: '2022-05-18',
    postCount: 4521,
    reputation: 7892,
    isOnline: true,
    role: 'moderator',
    location: 'Saffron City',
    bio: 'Helping collectors spot fakes and authenticate their collections.',
    badges: [
      {
        id: 'moderator',
        name: 'Moderator',
        icon: 'Shield',
        color: '#10B981',
        description: 'Community Moderator',
      },
      {
        id: 'authentication_expert',
        name: 'Authentication Expert',
        icon: 'Eye',
        color: '#6366F1',
        description: 'Card Authentication Specialist',
      },
      {
        id: 'educator',
        name: 'Educator',
        icon: 'BookOpen',
        color: '#8B5CF6',
        description: 'Community Educator',
      },
    ],
  },
  {
    id: '9',
    username: 'RainbowRareHunter',
    displayName: 'Rainbow Rare Hunter',
    avatar: '/images/pokemon/charizard.png',
    joinDate: '2023-04-12',
    postCount: 2156,
    reputation: 3421,
    isOnline: false,
    role: 'member',
    location: 'Rainbow Road',
    bio: 'Chasing those beautiful rainbow rares! Modern sets collector.',
    badges: [
      {
        id: 'collector',
        name: 'Dedicated Collector',
        icon: 'Star',
        color: '#EC4899',
        description: 'Serious Collector',
      },
      {
        id: 'modern_master',
        name: 'Modern Master',
        icon: 'Sparkles',
        color: '#06B6D4',
        description: 'Modern Sets Expert',
      },
    ],
  },
  {
    id: '10',
    username: 'InvestmentGuru',
    displayName: 'Investment Guru',
    avatar: '/images/pokemon/eevee.png',
    joinDate: '2022-11-30',
    postCount: 6234,
    reputation: 8156,
    isOnline: true,
    role: 'vip',
    location: 'Goldenrod City',
    bio: 'Investment analysis and market predictions. Making smart plays in the TCG market.',
    badges: [
      {
        id: 'vip',
        name: 'VIP',
        icon: 'Gem',
        color: '#EC4899',
        description: 'VIP Member',
      },
      {
        id: 'investment_expert',
        name: 'Investment Expert',
        icon: 'TrendingUp',
        color: '#F59E0B',
        description: 'TCG Investment Specialist',
      },
      {
        id: 'influencer',
        name: 'Community Influencer',
        icon: 'Users',
        color: '#6366F1',
        description: 'Community Leader',
      },
    ],
  },
];

/**
 * Get user by username
 */
export function getUserByUsername(username: string): User | undefined {
  return MOCK_USERS.find(
    user => user.username.toLowerCase() === username.toLowerCase()
  );
}

/**
 * Get multiple users by usernames
 */
export function getUsersByUsernames(usernames: string[]): User[] {
  return usernames
    .map(username => getUserByUsername(username))
    .filter((user): user is User => user !== undefined);
}

/**
 * Get online users
 */
export function getOnlineUsers(): User[] {
  return MOCK_USERS.filter(user => user.isOnline);
}
