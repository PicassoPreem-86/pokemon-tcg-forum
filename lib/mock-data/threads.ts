import { Thread } from '../types';
import { MOCK_USERS } from './users';

export const MOCK_THREADS: Thread[] = [
  // General Category
  {
    id: 'thread-gen-1',
    slug: 'welcome-to-pokemon-tcg-forum',
    title: 'Welcome to the Pokemon TCG Forum!',
    categoryId: 'general',
    authorId: 'user-1',
    author: MOCK_USERS[0],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-15T10:30:00Z',
    postCount: 342,
    viewCount: 15234,
    isPinned: true,
    lastReply: {
      userId: 'user-5',
      username: 'NewTrainer2024',
      timestamp: '2024-12-15T10:30:00Z',
    },
    excerpt: 'Welcome to the official Pokemon TCG Forum! Here you can discuss everything about Pokemon cards...',
  },
  {
    id: 'thread-gen-2',
    slug: 'best-budget-deck-local-tournaments',
    title: 'Best budget deck for local tournaments?',
    categoryId: 'general',
    authorId: 'user-5',
    author: MOCK_USERS[4],
    createdAt: '2024-12-10T12:00:00Z',
    updatedAt: '2024-12-15T09:15:00Z',
    postCount: 92,
    viewCount: 2890,
    lastReply: {
      userId: 'user-3',
      username: 'DeckBuilder99',
      timestamp: '2024-12-15T09:15:00Z',
    },
    excerpt: 'Looking for recommendations on budget-friendly decks that can compete at local tournaments...',
  },
  {
    id: 'thread-gen-3',
    slug: 'tcg-pocket-best-decks-ranked',
    title: 'TCG Pocket: Best decks for ranked ladder',
    categoryId: 'general',
    authorId: 'user-6',
    author: MOCK_USERS[5],
    createdAt: '2024-12-12T15:00:00Z',
    updatedAt: '2024-12-15T08:00:00Z',
    postCount: 167,
    viewCount: 7823,
    isHot: true,
    lastReply: {
      userId: 'user-9',
      username: 'TournamentKing',
      timestamp: '2024-12-15T08:00:00Z',
    },
    excerpt: 'Complete meta breakdown for Pokemon TCG Pocket ranked ladder. Top tier decks and strategies...',
  },

  // Collecting Category
  {
    id: 'thread-col-1',
    slug: 'complete-base-set-collection',
    title: 'My complete Base Set collection - finally done!',
    categoryId: 'collecting',
    authorId: 'user-2',
    author: MOCK_USERS[1],
    createdAt: '2024-12-14T10:00:00Z',
    updatedAt: '2024-12-15T11:45:00Z',
    postCount: 89,
    viewCount: 2341,
    isHot: true,
    isPinned: true,
    lastReply: {
      userId: 'user-8',
      username: 'GradedGuru',
      timestamp: '2024-12-15T11:45:00Z',
    },
    excerpt: 'After years of hunting, I finally completed my Base Set collection! Here are all 102 cards...',
  },
  {
    id: 'thread-col-2',
    slug: 'pulled-rainbow-rare-charizard',
    title: 'Just pulled a rainbow rare Charizard!',
    categoryId: 'collecting',
    authorId: 'user-7',
    author: MOCK_USERS[6],
    createdAt: '2024-12-13T18:30:00Z',
    updatedAt: '2024-12-15T11:20:00Z',
    postCount: 123,
    viewCount: 4567,
    isHot: true,
    lastReply: {
      userId: 'user-4',
      username: 'VintageTrader',
      timestamp: '2024-12-15T11:20:00Z',
    },
    excerpt: 'Can\'t believe my luck! Pulled this beautiful rainbow rare Charizard from my first booster box...',
  },
  {
    id: 'thread-col-3',
    slug: 'organizing-binder-tips',
    title: 'Organizing my binder - tips and tricks',
    categoryId: 'collecting',
    authorId: 'user-10',
    author: MOCK_USERS[9],
    createdAt: '2024-12-11T14:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
    postCount: 67,
    viewCount: 1892,
    lastReply: {
      userId: 'user-2',
      username: 'CharizardCollector',
      timestamp: '2024-12-15T10:00:00Z',
    },
    excerpt: 'How do you organize your collection? Share your binder organization methods and tips...',
  },

  // Market Category
  {
    id: 'thread-mar-1',
    slug: 'charizard-ex-market-analysis',
    title: 'Charizard ex market analysis - why prices are rising',
    categoryId: 'market',
    authorId: 'user-8',
    author: MOCK_USERS[7],
    createdAt: '2024-12-13T09:00:00Z',
    updatedAt: '2024-12-15T09:30:00Z',
    postCount: 78,
    viewCount: 3456,
    lastReply: {
      userId: 'user-4',
      username: 'VintageTrader',
      timestamp: '2024-12-15T09:30:00Z',
    },
    excerpt: 'Deep dive into the Charizard ex market. Supply, demand, and future price predictions...',
  },
  {
    id: 'thread-mar-2',
    slug: 'price-check-pristine-evolutions',
    title: 'Price check: Pristine Evolutions sealed boxes',
    categoryId: 'market',
    authorId: 'user-3',
    author: MOCK_USERS[2],
    createdAt: '2024-12-14T11:30:00Z',
    updatedAt: '2024-12-15T08:45:00Z',
    postCount: 34,
    viewCount: 1567,
    lastReply: {
      userId: 'user-8',
      username: 'GradedGuru',
      timestamp: '2024-12-15T08:45:00Z',
    },
    excerpt: 'Looking for current market prices on Pristine Evolutions sealed booster boxes...',
  },
  {
    id: 'thread-mar-3',
    slug: 'investment-vintage-wotc-cards',
    title: 'Investment opportunity: Vintage WOTC cards',
    categoryId: 'market',
    authorId: 'user-4',
    author: MOCK_USERS[3],
    createdAt: '2024-12-12T10:00:00Z',
    updatedAt: '2024-12-15T07:30:00Z',
    postCount: 91,
    viewCount: 2987,
    isHot: true,
    lastReply: {
      userId: 'user-2',
      username: 'CharizardCollector',
      timestamp: '2024-12-15T07:30:00Z',
    },
    excerpt: 'Vintage WOTC cards continue to appreciate. Here\'s why they\'re a solid long-term investment...',
  },

  // Grading Category
  {
    id: 'thread-gra-1',
    slug: 'psa-vs-cgc-comparison',
    title: 'PSA vs CGC - Which grading service is better in 2024?',
    categoryId: 'grading',
    authorId: 'user-8',
    author: MOCK_USERS[7],
    createdAt: '2024-12-12T08:00:00Z',
    updatedAt: '2024-12-15T11:00:00Z',
    postCount: 156,
    viewCount: 5678,
    isPinned: true,
    lastReply: {
      userId: 'user-2',
      username: 'CharizardCollector',
      timestamp: '2024-12-15T11:00:00Z',
    },
    excerpt: 'Comprehensive comparison of PSA vs CGC grading. Turnaround times, costs, and market value...',
  },
  {
    id: 'thread-gra-2',
    slug: 'psa-10-charizard-arrived',
    title: 'My PSA 10 Charizard just arrived!',
    categoryId: 'grading',
    authorId: 'user-2',
    author: MOCK_USERS[1],
    createdAt: '2024-12-14T16:00:00Z',
    updatedAt: '2024-12-15T10:15:00Z',
    postCount: 67,
    viewCount: 3421,
    isHot: true,
    lastReply: {
      userId: 'user-7',
      username: 'ShinyHunter',
      timestamp: '2024-12-15T10:15:00Z',
    },
    excerpt: 'Just got my Base Set Charizard back from PSA - it graded a perfect 10!',
  },
  {
    id: 'thread-gra-3',
    slug: 'bgs-grading-turnaround-times',
    title: 'BGS grading turnaround times - current wait',
    categoryId: 'grading',
    authorId: 'user-5',
    author: MOCK_USERS[4],
    createdAt: '2024-12-13T13:00:00Z',
    updatedAt: '2024-12-15T09:00:00Z',
    postCount: 45,
    viewCount: 1234,
    lastReply: {
      userId: 'user-8',
      username: 'GradedGuru',
      timestamp: '2024-12-15T09:00:00Z',
    },
    excerpt: 'Share your recent BGS grading experiences. How long are turnaround times currently?',
  },

  // Articles Category
  {
    id: 'thread-art-1',
    slug: 'guide-spot-fake-pokemon-cards',
    title: 'Complete Guide: How to spot fake Pokemon cards',
    categoryId: 'articles',
    authorId: 'user-1',
    author: MOCK_USERS[0],
    createdAt: '2024-12-10T09:00:00Z',
    updatedAt: '2024-12-15T08:30:00Z',
    postCount: 234,
    viewCount: 12456,
    isHot: true,
    isPinned: true,
    lastReply: {
      userId: 'user-5',
      username: 'NewTrainer2024',
      timestamp: '2024-12-15T08:30:00Z',
    },
    excerpt: 'Comprehensive guide on identifying fake Pokemon cards. Learn the telltale signs and protect yourself...',
  },
  {
    id: 'thread-art-2',
    slug: 'beginners-guide-tcg-investing',
    title: 'Beginner\'s guide to Pokemon TCG investing',
    categoryId: 'articles',
    authorId: 'user-4',
    author: MOCK_USERS[3],
    createdAt: '2024-12-08T10:00:00Z',
    updatedAt: '2024-12-15T07:00:00Z',
    postCount: 178,
    viewCount: 8934,
    lastReply: {
      userId: 'user-6',
      username: 'MewtwoPro',
      timestamp: '2024-12-15T07:00:00Z',
    },
    excerpt: 'New to investing in Pokemon cards? Start here with our comprehensive beginner\'s guide...',
  },

  // News Category
  {
    id: 'thread-new-1',
    slug: 'prismatic-evolutions-set-list',
    title: 'Prismatic Evolutions - Full Set List Revealed!',
    categoryId: 'news',
    authorId: 'user-1',
    author: MOCK_USERS[0],
    createdAt: '2024-12-15T08:00:00Z',
    updatedAt: '2024-12-15T11:55:00Z',
    postCount: 234,
    viewCount: 8923,
    isPinned: true,
    isHot: true,
    lastReply: {
      userId: 'user-7',
      username: 'ShinyHunter',
      timestamp: '2024-12-15T11:55:00Z',
    },
    excerpt: 'The complete Prismatic Evolutions set list has been officially revealed! Check out all the new cards...',
  },
  {
    id: 'thread-new-2',
    slug: 'new-tcg-set-spring-2025',
    title: 'New Pokemon TCG Set Announced for Spring 2025',
    categoryId: 'news',
    authorId: 'user-3',
    author: MOCK_USERS[2],
    createdAt: '2024-12-14T12:00:00Z',
    updatedAt: '2024-12-15T10:30:00Z',
    postCount: 145,
    viewCount: 6745,
    isHot: true,
    lastReply: {
      userId: 'user-9',
      username: 'TournamentKing',
      timestamp: '2024-12-15T10:30:00Z',
    },
    excerpt: 'Pokemon Company announces new TCG set for Spring 2025 featuring new mechanics...',
  },

  // Buy & Trade Category
  {
    id: 'thread-tra-1',
    slug: 'alt-arts-secret-rares-for-trade',
    title: '[H] Alt Arts, Secret Rares [W] PayPal or Trades',
    categoryId: 'buy-trade',
    authorId: 'user-10',
    author: MOCK_USERS[9],
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2024-12-15T11:30:00Z',
    postCount: 45,
    viewCount: 1234,
    lastReply: {
      userId: 'user-4',
      username: 'VintageTrader',
      timestamp: '2024-12-15T11:30:00Z',
    },
    excerpt: 'Have several alt art and secret rare cards for trade. Open to PayPal or card trades...',
  },
  {
    id: 'thread-tra-2',
    slug: 'wtb-charizard-base-set-1st-edition',
    title: 'WTB: Charizard Base Set 1st Edition',
    categoryId: 'buy-trade',
    authorId: 'user-2',
    author: MOCK_USERS[1],
    createdAt: '2024-12-14T14:00:00Z',
    updatedAt: '2024-12-15T10:45:00Z',
    postCount: 67,
    viewCount: 2345,
    isHot: true,
    lastReply: {
      userId: 'user-8',
      username: 'GradedGuru',
      timestamp: '2024-12-15T10:45:00Z',
    },
    excerpt: 'Looking to buy a Base Set 1st Edition Charizard in near mint or better condition...',
  },
  {
    id: 'thread-tra-3',
    slug: 'trading-pikachu-v-union',
    title: 'Trading my Pikachu V-Union for other V-Unions',
    categoryId: 'buy-trade',
    authorId: 'user-1',
    author: MOCK_USERS[0],
    createdAt: '2024-12-13T11:00:00Z',
    updatedAt: '2024-12-15T09:20:00Z',
    postCount: 23,
    viewCount: 987,
    lastReply: {
      userId: 'user-6',
      username: 'MewtwoPro',
      timestamp: '2024-12-15T09:20:00Z',
    },
    excerpt: 'Have a complete Pikachu V-Union set. Looking to trade for other V-Union sets...',
  },

  // Trading Category
  {
    id: 'thread-1',
    slug: 'looking-for-base-set-charizard-have-trades',
    title: '[LF] Base Set Charizard - Have Great Trades!',
    categoryId: 'trading',
    authorId: 'user-4',
    author: MOCK_USERS[3],
    createdAt: '2024-12-10T14:30:00Z',
    updatedAt: '2024-12-15T09:15:00Z',
    postCount: 47,
    viewCount: 1256,
    isPinned: false,
    isHot: true,
    tags: ['base-set', 'charizard', 'trade'],
    lastReply: {
      userId: 'user-2',
      username: 'CharizardCollector',
      timestamp: '2024-12-15T09:15:00Z',
    },
    excerpt: 'Looking for a Base Set Charizard in NM condition. I have several vintage holos to trade including...',
  },
  {
    id: 'thread-2',
    slug: 'selling-complete-sv-151-master-set',
    title: '[FS] Complete SV 151 Master Set - Excellent Condition',
    categoryId: 'trading',
    authorId: 'user-6',
    author: MOCK_USERS[5],
    createdAt: '2024-12-12T10:00:00Z',
    updatedAt: '2024-12-14T16:45:00Z',
    postCount: 23,
    viewCount: 892,
    tags: ['sv-151', 'master-set', 'selling'],
    lastReply: {
      userId: 'user-5',
      username: 'NewTrainer2024',
      timestamp: '2024-12-14T16:45:00Z',
    },
    excerpt: 'Selling my complete SV 151 master set. Includes all cards from base to secret rares...',
  },
  {
    id: 'thread-3',
    slug: 'price-check-psa-10-shining-charizard',
    title: '[PC] PSA 10 Shining Charizard Neo Destiny',
    categoryId: 'trading',
    subcategoryId: 'price-checks',
    authorId: 'user-8',
    author: MOCK_USERS[7],
    createdAt: '2024-12-14T08:20:00Z',
    updatedAt: '2024-12-15T11:30:00Z',
    postCount: 18,
    viewCount: 634,
    tags: ['psa-10', 'shining', 'neo-destiny'],
    lastReply: {
      userId: 'user-1',
      username: 'PikachuMaster',
      timestamp: '2024-12-15T11:30:00Z',
    },
    excerpt: 'Looking for a price check on my PSA 10 Shining Charizard. Pop report shows only...',
  },

  // Deck Building Category
  {
    id: 'thread-4',
    slug: 'best-charizard-ex-deck-december-2024',
    title: 'Best Charizard ex Deck - December 2024 Meta',
    categoryId: 'deck-building',
    subcategoryId: 'standard',
    authorId: 'user-3',
    author: MOCK_USERS[2],
    createdAt: '2024-12-08T12:00:00Z',
    updatedAt: '2024-12-15T08:00:00Z',
    postCount: 156,
    viewCount: 4521,
    isPinned: true,
    isHot: true,
    tags: ['charizard-ex', 'meta', 'standard'],
    lastReply: {
      userId: 'user-9',
      username: 'TournamentKing',
      timestamp: '2024-12-15T08:00:00Z',
    },
    excerpt: 'Complete guide to the current Charizard ex deck. Includes matchup analysis, tech choices...',
  },
  {
    id: 'thread-5',
    slug: 'budget-iron-hands-deck-under-50',
    title: 'Budget Iron Hands Deck Under $50 - Complete Guide',
    categoryId: 'deck-building',
    subcategoryId: 'casual',
    authorId: 'user-9',
    author: MOCK_USERS[8],
    createdAt: '2024-12-11T15:30:00Z',
    updatedAt: '2024-12-14T19:20:00Z',
    postCount: 67,
    viewCount: 2134,
    tags: ['budget', 'iron-hands', 'guide'],
    lastReply: {
      userId: 'user-10',
      username: 'BulbasaurFan',
      timestamp: '2024-12-14T19:20:00Z',
    },
    excerpt: 'Want to play competitively without breaking the bank? This Iron Hands build is under $50...',
  },

  // Tournament Category
  {
    id: 'thread-6',
    slug: 'laic-2024-results-and-discussion',
    title: 'LAIC 2024 Results & Top 8 Deck Analysis',
    categoryId: 'tournaments',
    subcategoryId: 'official',
    authorId: 'user-1',
    author: MOCK_USERS[0],
    createdAt: '2024-12-09T18:00:00Z',
    updatedAt: '2024-12-15T10:45:00Z',
    postCount: 234,
    viewCount: 8923,
    isPinned: true,
    isHot: true,
    tags: ['laic', 'regionals', 'top-8'],
    lastReply: {
      userId: 'user-3',
      username: 'DeckBuilder99',
      timestamp: '2024-12-15T10:45:00Z',
    },
    excerpt: 'Full breakdown of the Latin America International Championships. Top 8 decklists and meta analysis...',
  },
  {
    id: 'thread-7',
    slug: 'finding-local-league-cups-tips',
    title: 'Tips for Finding Local League Cups Near You',
    categoryId: 'tournaments',
    subcategoryId: 'local',
    authorId: 'user-9',
    author: MOCK_USERS[8],
    createdAt: '2024-12-05T11:00:00Z',
    updatedAt: '2024-12-13T14:30:00Z',
    postCount: 45,
    viewCount: 1567,
    tags: ['league-cup', 'local', 'tips'],
    lastReply: {
      userId: 'user-7',
      username: 'ShinyHunter',
      timestamp: '2024-12-13T14:30:00Z',
    },
  },

  // News Category
  {
    id: 'thread-8',
    slug: 'surging-sparks-set-revealed',
    title: 'Surging Sparks Set List Revealed - All New Cards!',
    categoryId: 'news',
    authorId: 'user-1',
    author: MOCK_USERS[0],
    createdAt: '2024-12-01T09:00:00Z',
    updatedAt: '2024-12-15T07:30:00Z',
    postCount: 312,
    viewCount: 15234,
    isPinned: true,
    isHot: true,
    tags: ['surging-sparks', 'new-set', 'reveal'],
    lastReply: {
      userId: 'user-7',
      username: 'ShinyHunter',
      timestamp: '2024-12-15T07:30:00Z',
    },
    excerpt: 'The complete Surging Sparks set list has been revealed! Includes the new Pikachu ex SAR...',
  },
  {
    id: 'thread-9',
    slug: '2025-rotation-announcement',
    title: '2025 Rotation Announcement - What\'s Leaving Standard',
    categoryId: 'news',
    authorId: 'user-2',
    author: MOCK_USERS[1],
    createdAt: '2024-11-28T14:00:00Z',
    updatedAt: '2024-12-10T12:00:00Z',
    postCount: 189,
    viewCount: 7845,
    tags: ['rotation', '2025', 'standard'],
    lastReply: {
      userId: 'user-3',
      username: 'DeckBuilder99',
      timestamp: '2024-12-10T12:00:00Z',
    },
  },

  // Collections Category
  {
    id: 'thread-10',
    slug: 'my-complete-wotc-collection',
    title: 'My Complete WOTC Collection - 25 Years in the Making',
    categoryId: 'collections',
    subcategoryId: 'vintage',
    authorId: 'user-4',
    author: MOCK_USERS[3],
    createdAt: '2024-12-03T16:00:00Z',
    updatedAt: '2024-12-14T20:15:00Z',
    postCount: 89,
    viewCount: 3456,
    isHot: true,
    tags: ['wotc', 'vintage', 'complete'],
    lastReply: {
      userId: 'user-8',
      username: 'GradedGuru',
      timestamp: '2024-12-14T20:15:00Z',
    },
    excerpt: 'Finally completed my WOTC collection after 25 years! Includes every English set from Base to Neo...',
  },
  {
    id: 'thread-11',
    slug: 'surging-sparks-pull-rates-discussion',
    title: 'Surging Sparks Pull Rates - Share Your Results!',
    categoryId: 'collections',
    subcategoryId: 'pulls',
    authorId: 'user-7',
    author: MOCK_USERS[6],
    createdAt: '2024-12-13T10:30:00Z',
    updatedAt: '2024-12-15T11:00:00Z',
    postCount: 234,
    viewCount: 5678,
    isHot: true,
    tags: ['surging-sparks', 'pulls', 'rates'],
    lastReply: {
      userId: 'user-5',
      username: 'NewTrainer2024',
      timestamp: '2024-12-15T11:00:00Z',
    },
    excerpt: 'Post your Surging Sparks opening results here! Let\'s compile data on pull rates...',
  },

  // Price Guides Category
  {
    id: 'thread-12',
    slug: 'december-2024-market-update',
    title: 'December 2024 Market Update - Prices Rising?',
    categoryId: 'price-guides',
    subcategoryId: 'trends',
    authorId: 'user-8',
    author: MOCK_USERS[7],
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-15T06:00:00Z',
    postCount: 145,
    viewCount: 6789,
    isPinned: true,
    tags: ['market', 'prices', 'december'],
    lastReply: {
      userId: 'user-4',
      username: 'VintageTrader',
      timestamp: '2024-12-15T06:00:00Z',
    },
    excerpt: 'Monthly market analysis for December 2024. Vintage prices continue to climb while modern...',
  },
  {
    id: 'thread-13',
    slug: 'psa-vs-cgc-vs-bgs-which-grading',
    title: 'PSA vs CGC vs BGS - Which Grading Company in 2024?',
    categoryId: 'price-guides',
    subcategoryId: 'grading-guide',
    authorId: 'user-8',
    author: MOCK_USERS[7],
    createdAt: '2024-11-15T12:00:00Z',
    updatedAt: '2024-12-12T18:30:00Z',
    postCount: 267,
    viewCount: 9234,
    tags: ['grading', 'psa', 'cgc', 'bgs'],
    lastReply: {
      userId: 'user-6',
      username: 'MewtwoPro',
      timestamp: '2024-12-12T18:30:00Z',
    },
  },

  // General Category
  {
    id: 'thread-14',
    slug: 'introduce-yourself-december-2024',
    title: 'Introduce Yourself - December 2024',
    categoryId: 'general',
    subcategoryId: 'introductions',
    authorId: 'user-1',
    author: MOCK_USERS[0],
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-15T12:00:00Z',
    postCount: 156,
    viewCount: 2345,
    isPinned: true,
    tags: ['introductions', 'welcome'],
    lastReply: {
      userId: 'user-5',
      username: 'NewTrainer2024',
      timestamp: '2024-12-15T12:00:00Z',
    },
    excerpt: 'New to the forum? Introduce yourself here! Tell us about your collection and what got you into TCG...',
  },
  {
    id: 'thread-15',
    slug: 'favorite-pokemon-and-why',
    title: 'What\'s Your Favorite Pokémon Card and Why?',
    categoryId: 'general',
    subcategoryId: 'off-topic',
    authorId: 'user-10',
    author: MOCK_USERS[9],
    createdAt: '2024-12-10T20:00:00Z',
    updatedAt: '2024-12-14T22:45:00Z',
    postCount: 98,
    viewCount: 1234,
    tags: ['discussion', 'favorites'],
    lastReply: {
      userId: 'user-7',
      username: 'ShinyHunter',
      timestamp: '2024-12-14T22:45:00Z',
    },
  },
];

export const getThreadsByCategory = (categoryId: string): Thread[] => {
  return MOCK_THREADS.filter(thread => thread.categoryId === categoryId);
};

export const getPinnedThreads = (): Thread[] => {
  return MOCK_THREADS.filter(thread => thread.isPinned);
};

export const getHotThreads = (): Thread[] => {
  return MOCK_THREADS.filter(thread => thread.isHot);
};

export const getRecentThreads = (limit: number = 10): Thread[] => {
  return [...MOCK_THREADS]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
};

export const getThreadById = (id: string): Thread | undefined => {
  return MOCK_THREADS.find(thread => thread.id === id);
};

export const getThreadBySlug = (slug: string): Thread | undefined => {
  return MOCK_THREADS.find(thread => thread.slug === slug);
};

/**
 * Get all unique tags from threads
 */
export const getAllTags = (): string[] => {
  const tagSet = new Set<string>();
  MOCK_THREADS.forEach(thread => {
    if (thread.tags) {
      thread.tags.forEach(tag => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
};

/**
 * Get threads by tag
 */
export const getThreadsByTag = (tag: string): Thread[] => {
  return MOCK_THREADS.filter(
    thread => thread.tags?.includes(tag.toLowerCase())
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

/**
 * Get popular tags with counts
 */
export interface TagWithCount {
  tag: string;
  count: number;
}

export const getPopularTags = (limit: number = 20): TagWithCount[] => {
  const tagCounts = new Map<string, number>();

  MOCK_THREADS.forEach(thread => {
    if (thread.tags) {
      thread.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    }
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

/**
 * Search tags by query
 */
export const searchTags = (query: string): string[] => {
  const lowerQuery = query.toLowerCase();
  return getAllTags().filter(tag => tag.includes(lowerQuery));
};

// ============================================
// TRENDING ALGORITHM
// ============================================

export interface TrendingThread extends Thread {
  trendingScore: number;
  trendingRank: number;
  viewVelocity: number;    // views per hour
  replyVelocity: number;   // replies per hour
  engagementRate: number;  // replies / views ratio
  hoursOld: number;
}

/**
 * Calculate the age of a thread in hours
 */
const getHoursOld = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.max(1, diffMs / (1000 * 60 * 60)); // Minimum 1 hour to avoid division issues
};

/**
 * Calculate trending score for a thread
 *
 * The algorithm considers:
 * - View velocity (views per hour) - weighted at 40%
 * - Reply velocity (replies per hour) - weighted at 35%
 * - Engagement rate (replies/views) - weighted at 15%
 * - Recency boost (newer threads get a multiplier) - weighted at 10%
 *
 * Score decays over time using a logarithmic decay function
 */
export const calculateTrendingScore = (thread: Thread): {
  score: number;
  viewVelocity: number;
  replyVelocity: number;
  engagementRate: number;
  hoursOld: number;
} => {
  const hoursOld = getHoursOld(thread.updatedAt);
  const hoursCreated = getHoursOld(thread.createdAt);

  // Calculate velocities (per hour)
  const viewVelocity = thread.viewCount / hoursCreated;
  const replyVelocity = thread.postCount / hoursCreated;

  // Engagement rate (replies per 100 views)
  const engagementRate = thread.viewCount > 0
    ? (thread.postCount / thread.viewCount) * 100
    : 0;

  // Recency multiplier - threads updated recently get a boost
  // Uses logarithmic decay: newer = higher multiplier
  // 1 hour old = 2.0x, 24 hours = 1.3x, 48 hours = 1.15x, 7 days = 1.0x
  const recencyMultiplier = Math.max(1, 2 - Math.log10(hoursOld + 1) / 2);

  // Activity burst detection - high recent activity boosts score
  // If updated very recently relative to creation, it's "bursting"
  const activityRatio = hoursOld / Math.max(1, hoursCreated);
  const burstMultiplier = activityRatio < 0.1 ? 1.5 : activityRatio < 0.25 ? 1.25 : 1;

  // Calculate weighted score components
  const viewScore = viewVelocity * 0.4;          // 40% weight
  const replyScore = replyVelocity * 10 * 0.35;  // 35% weight (multiplied by 10 since replies < views)
  const engagementScore = engagementRate * 0.15; // 15% weight
  const recencyScore = recencyMultiplier * 10;   // Base recency contribution

  // Combine scores
  let score = (viewScore + replyScore + engagementScore + recencyScore) * burstMultiplier;

  // Pinned threads get a small boost but shouldn't dominate
  if (thread.isPinned) {
    score *= 1.1;
  }

  // Already marked "hot" threads get validated by algorithm
  if (thread.isHot) {
    score *= 1.2;
  }

  return {
    score: Math.round(score * 100) / 100,
    viewVelocity: Math.round(viewVelocity * 100) / 100,
    replyVelocity: Math.round(replyVelocity * 100) / 100,
    engagementRate: Math.round(engagementRate * 100) / 100,
    hoursOld: Math.round(hoursOld),
  };
};

/**
 * Get trending threads sorted by trending score
 */
export const getTrendingThreads = (limit: number = 20): TrendingThread[] => {
  const threadsWithScores = MOCK_THREADS.map(thread => {
    const metrics = calculateTrendingScore(thread);
    return {
      ...thread,
      trendingScore: metrics.score,
      trendingRank: 0, // Will be set after sorting
      viewVelocity: metrics.viewVelocity,
      replyVelocity: metrics.replyVelocity,
      engagementRate: metrics.engagementRate,
      hoursOld: metrics.hoursOld,
    };
  });

  // Sort by trending score (highest first)
  threadsWithScores.sort((a, b) => b.trendingScore - a.trendingScore);

  // Assign ranks
  threadsWithScores.forEach((thread, index) => {
    thread.trendingRank = index + 1;
  });

  return threadsWithScores.slice(0, limit);
};

/**
 * Get threads that are "rising" - high velocity but not yet top trending
 * These are threads showing momentum that could become hot
 */
export const getRisingThreads = (limit: number = 10): TrendingThread[] => {
  const allTrending = getTrendingThreads(100);

  // Rising = high velocity but not in top 10, and relatively new (< 48 hours old)
  return allTrending
    .filter(t => t.trendingRank > 10 && t.hoursOld < 48)
    .sort((a, b) => b.replyVelocity - a.replyVelocity)
    .slice(0, limit);
};

/**
 * Determine the "heat level" of a thread based on its trending score
 * Returns: 'fire' | 'hot' | 'warm' | 'normal'
 */
export const getHeatLevel = (trendingScore: number): 'fire' | 'hot' | 'warm' | 'normal' => {
  if (trendingScore >= 50) return 'fire';
  if (trendingScore >= 25) return 'hot';
  if (trendingScore >= 10) return 'warm';
  return 'normal';
};

/**
 * Get trending stats summary
 */
export const getTrendingStats = () => {
  const trending = getTrendingThreads(100);
  const avgScore = trending.reduce((sum, t) => sum + t.trendingScore, 0) / trending.length;
  const topThread = trending[0];
  const fireCount = trending.filter(t => getHeatLevel(t.trendingScore) === 'fire').length;
  const hotCount = trending.filter(t => getHeatLevel(t.trendingScore) === 'hot').length;

  return {
    averageScore: Math.round(avgScore * 100) / 100,
    topThread,
    fireCount,
    hotCount,
    totalTracked: trending.length,
  };
};
