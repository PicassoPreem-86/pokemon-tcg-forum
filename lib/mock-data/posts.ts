// Mock data for thread posts and replies

export interface Post {
  id: string;
  threadId: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
    role: 'member' | 'moderator' | 'admin' | 'vip';
    postCount: number;
    reputation: number;
    joinDate: string;
    location?: string;
    signature?: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  likedBy: string[];
  isOriginalPost: boolean;
  quotedPost?: {
    id: string;
    author: string;
    preview: string;
  };
  attachments?: {
    type: 'image' | 'link';
    url: string;
    title?: string;
  }[];
}

export interface ThreadDetail {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  categoryColor: string;
  isPinned: boolean;
  isLocked: boolean;
  isHot: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  lastActivity: string;
  posts: Post[];
  tags?: string[];
}

// Sample thread with posts
export const MOCK_THREADS_DETAIL: Record<string, ThreadDetail> = {
  '1': {
    id: '1',
    title: 'Prismatic Evolutions - Full Set List Revealed!',
    category: 'News',
    categorySlug: 'news',
    categoryColor: '#F97316',
    isPinned: true,
    isLocked: false,
    isHot: true,
    viewCount: 8934,
    replyCount: 234,
    createdAt: '2024-01-15T10:30:00Z',
    lastActivity: '2 min ago',
    tags: ['prismatic-evolutions', 'set-reveal', 'official'],
    posts: [
      {
        id: 'p1',
        threadId: '1',
        author: {
          username: 'PikachuMaster',
          displayName: 'Pikachu Master',
          avatar: '/images/avatars/default.png',
          role: 'admin',
          postCount: 15420,
          reputation: 28500,
          joinDate: '2019-03-15',
          location: 'Kanto Region',
          signature: '⚡ Catching them all since 1996 ⚡'
        },
        content: `# Prismatic Evolutions Full Set List is HERE!

The Pokemon Company has finally revealed the complete set list for **Prismatic Evolutions**, and it's absolutely STACKED!

## Key Highlights:

### Chase Cards
- **Umbreon ex SAR** - Already predicted to be the most valuable card
- **Pikachu VMAX Rainbow** - Classic fan favorite
- **Charizard ex Gold** - Because every set needs a Charizard chase card

### New Mechanics
The set introduces the new **Prism Star** mechanic, allowing only one Prism Star card per deck. These cards have incredibly powerful effects but come with restrictions.

### Pull Rates
Based on early Japanese box openings:
- 1 SAR per 2-3 boxes
- 1 Gold card per 4 boxes average
- Full arts appear roughly 1 per box

## My Predictions

I think this set will age very well. The artwork is phenomenal and the chase cards are some of the best we've seen in the Scarlet & Violet era.

What cards are you most excited to pull? Drop your thoughts below! 👇

---
*Images and official card list attached below*`,
        createdAt: '2024-01-15T10:30:00Z',
        likes: 847,
        likedBy: ['VintageCollector', 'CardTrader99', 'GradeHunter'],
        isOriginalPost: true,
        attachments: [
          { type: 'image', url: '/images/cards/prismatic-box.png', title: 'Prismatic Evolutions Booster Box' }
        ]
      },
      {
        id: 'p2',
        threadId: '1',
        author: {
          username: 'VintageCollector',
          displayName: 'Vintage Collector',
          avatar: '/images/avatars/default.png',
          role: 'vip',
          postCount: 8934,
          reputation: 15200,
          joinDate: '2020-06-22',
          location: 'Tokyo, Japan'
        },
        content: `That Umbreon SAR is going to break records, I'm calling it now! 🌙

I've already pre-ordered 3 cases. The Japanese version has been selling for crazy prices and the English version will likely follow.

Anyone know when pre-orders go live for the ETBs?`,
        createdAt: '2024-01-15T10:45:00Z',
        likes: 156,
        likedBy: ['PikachuMaster', 'CardTrader99'],
        isOriginalPost: false
      },
      {
        id: 'p3',
        threadId: '1',
        author: {
          username: 'CardTrader99',
          displayName: 'Card Trader',
          avatar: '/images/avatars/default.png',
          role: 'member',
          postCount: 2341,
          reputation: 4500,
          joinDate: '2021-11-08',
          signature: '📦 100+ successful trades | ⭐ 5.0 rating'
        },
        content: `Great breakdown! Thanks for compiling all this info.

One thing I'd add - the pull rates for the Japanese version seemed slightly better than what we usually see in English sets. Fingers crossed TPCi doesn't nerf them too hard 🤞`,
        createdAt: '2024-01-15T11:02:00Z',
        likes: 89,
        likedBy: ['PikachuMaster'],
        isOriginalPost: false,
        quotedPost: {
          id: 'p1',
          author: 'PikachuMaster',
          preview: 'Based on early Japanese box openings: 1 SAR per 2-3 boxes...'
        }
      },
      {
        id: 'p4',
        threadId: '1',
        author: {
          username: 'GradeHunter',
          displayName: 'Grade Hunter',
          avatar: '/images/avatars/default.png',
          role: 'moderator',
          postCount: 6721,
          reputation: 12800,
          joinDate: '2020-02-14',
          location: 'PSA Grading Queue 😅'
        },
        content: `Already planning my grading submissions for this set. The Umbreon and that new Eeveelution art will be PSA 10 goldmines.

**Pro tip for new collectors:** Wait a few months after release before grading. The initial rush always has longer turnaround times and the raw card prices will settle.

Current PSA turnaround for regular service is around 65 business days. Express is backed up too.`,
        createdAt: '2024-01-15T11:30:00Z',
        likes: 234,
        likedBy: ['PikachuMaster', 'VintageCollector', 'CardTrader99'],
        isOriginalPost: false
      },
      {
        id: 'p5',
        threadId: '1',
        author: {
          username: 'NewPlayer2024',
          displayName: 'New Player',
          avatar: '/images/avatars/default.png',
          role: 'member',
          postCount: 47,
          reputation: 85,
          joinDate: '2024-01-02'
        },
        content: `This is my first set release since getting into the hobby! So excited!

Quick question - should I buy singles or try my luck with sealed product? Budget is around $200.`,
        createdAt: '2024-01-15T12:15:00Z',
        likes: 23,
        likedBy: [],
        isOriginalPost: false
      },
      {
        id: 'p6',
        threadId: '1',
        author: {
          username: 'PikachuMaster',
          displayName: 'Pikachu Master',
          avatar: '/images/avatars/default.png',
          role: 'admin',
          postCount: 15420,
          reputation: 28500,
          joinDate: '2019-03-15',
          location: 'Kanto Region',
          signature: '⚡ Catching them all since 1996 ⚡'
        },
        content: `Welcome to the hobby! 🎉

For $200, here's my honest advice:

**If you want specific cards:** Buy singles. You'll get exactly what you want without gambling.

**If you enjoy the thrill of opening:** Get 1 ETB ($50) for the experience, then spend the rest on singles.

**Never** expect to pull your money back from sealed product. Open packs for fun, buy singles for collecting.

Hope that helps! Feel free to ask more questions - we were all new once! 😊`,
        createdAt: '2024-01-15T12:30:00Z',
        likes: 312,
        likedBy: ['NewPlayer2024', 'VintageCollector', 'GradeHunter'],
        isOriginalPost: false,
        quotedPost: {
          id: 'p5',
          author: 'NewPlayer2024',
          preview: 'Quick question - should I buy singles or try my luck with sealed product?'
        }
      }
    ]
  },
  '2': {
    id: '2',
    title: 'My complete Base Set collection - finally done!',
    category: 'Collecting',
    categorySlug: 'collecting',
    categoryColor: '#10B981',
    isPinned: false,
    isLocked: false,
    isHot: true,
    viewCount: 2341,
    replyCount: 89,
    createdAt: '2024-01-14T15:20:00Z',
    lastActivity: '15 min ago',
    tags: ['base-set', 'complete-collection', 'vintage'],
    posts: [
      {
        id: 'p1',
        threadId: '2',
        author: {
          username: 'VintageCollector',
          displayName: 'Vintage Collector',
          avatar: '/images/avatars/default.png',
          role: 'vip',
          postCount: 8934,
          reputation: 15200,
          joinDate: '2020-06-22',
          location: 'Tokyo, Japan'
        },
        content: `# IT'S FINALLY COMPLETE! 🎊

After 4 years of hunting, trading, and way too much money spent... I've finally completed my **1st Edition Base Set**!

The last card I needed was the Chansey holo. Found it at a local card show last weekend for a great price.

## The Collection Stats:
- All 102 cards ✅
- 16 Holos including the Big 3 (Charizard, Blastoise, Venusaur)
- All 1st Edition stamps verified
- Average condition: NM-MT

## The Crown Jewels:
1. **1st Ed Charizard** - PSA 8, my most prized possession
2. **1st Ed Blastoise** - Raw but gorgeous, probably PSA 7-8
3. **1st Ed Venusaur** - PSA 9! Got lucky on this one

## Total Investment:
I don't even want to calculate it... but let's just say my wife would not be happy 😂

Worth every penny though. This set defined my childhood and now I own a piece of Pokemon history.

Pics attached! Let me know what you think!`,
        createdAt: '2024-01-14T15:20:00Z',
        likes: 523,
        likedBy: ['PikachuMaster', 'CardTrader99', 'GradeHunter'],
        isOriginalPost: true
      },
      {
        id: 'p2',
        threadId: '2',
        author: {
          username: 'PikachuMaster',
          displayName: 'Pikachu Master',
          avatar: '/images/avatars/default.png',
          role: 'admin',
          postCount: 15420,
          reputation: 28500,
          joinDate: '2019-03-15',
          location: 'Kanto Region'
        },
        content: `This is INCREDIBLE! Congrats on completing the holy grail of Pokemon collections! 🏆

That PSA 9 Venusaur is chef's kiss. Those are getting harder to find every year.

Pinning this to inspire other collectors! Well done! 👏`,
        createdAt: '2024-01-14T15:35:00Z',
        likes: 89,
        likedBy: ['VintageCollector'],
        isOriginalPost: false
      }
    ]
  },
  '3': {
    id: '3',
    title: 'PSA vs CGC - Which grading service is better in 2024?',
    category: 'Grading',
    categorySlug: 'grading',
    categoryColor: '#EF4444',
    isPinned: false,
    isLocked: false,
    isHot: false,
    viewCount: 5678,
    replyCount: 156,
    createdAt: '2024-01-14T08:00:00Z',
    lastActivity: '32 min ago',
    tags: ['psa', 'cgc', 'grading', 'comparison'],
    posts: [
      {
        id: 'p1',
        threadId: '3',
        author: {
          username: 'GradeHunter',
          displayName: 'Grade Hunter',
          avatar: '/images/avatars/default.png',
          role: 'moderator',
          postCount: 6721,
          reputation: 12800,
          joinDate: '2020-02-14',
          location: 'PSA Grading Queue'
        },
        content: `# PSA vs CGC - The Ultimate 2024 Comparison

Been grading cards for 5 years now and I've used both services extensively. Here's my honest breakdown:

## PSA Pros:
- Industry standard, highest resale value
- Beautiful labels and cases
- Strong authentication

## PSA Cons:
- Expensive ($50-150 per card)
- Long wait times (2-6 months)
- No subgrades

## CGC Pros:
- Subgrades included
- Faster turnaround
- More affordable ($15-30)
- Inner sleeve protection

## CGC Cons:
- Lower resale premium
- Less recognized internationally
- Cases scratch easier

**My verdict:** PSA for high-value vintage, CGC for modern and personal collection.

What's your experience?`,
        createdAt: '2024-01-14T08:00:00Z',
        likes: 445,
        likedBy: [],
        isOriginalPost: true
      }
    ]
  },
  '4': {
    id: '4',
    title: '[H] Alt Arts, Secret Rares [W] PayPal or Trades',
    category: 'Buy & Trade',
    categorySlug: 'buy-trade',
    categoryColor: '#06B6D4',
    isPinned: false,
    isLocked: false,
    isHot: false,
    viewCount: 1234,
    replyCount: 45,
    createdAt: '2024-01-15T06:00:00Z',
    lastActivity: '1 hour ago',
    tags: ['trade', 'alt-art', 'secret-rare', 'paypal'],
    posts: [
      {
        id: 'p1',
        threadId: '4',
        author: {
          username: 'CardTrader99',
          displayName: 'Card Trader',
          avatar: '/images/avatars/default.png',
          role: 'member',
          postCount: 2341,
          reputation: 4500,
          joinDate: '2021-11-08',
          signature: '100+ successful trades | 5.0 rating'
        },
        content: `# Trade Thread - Updated Daily!

**HAVE:**
- Charizard ex Alt Art (SV3) - $85
- Umbreon VMAX Alt Art - $120
- Miraidon ex SAR - $45
- Iono SAR - $55
- Various Gold cards - ask!

**WANT:**
- PayPal (prices above)
- Moonbreon (will add PayPal)
- Rayquaza VMAX Alt Art
- Vintage holos NM+

Prices include tracked shipping. International buyers add $10.

References available. DM to trade!`,
        createdAt: '2024-01-15T06:00:00Z',
        likes: 34,
        likedBy: [],
        isOriginalPost: true
      }
    ]
  },
  '5': {
    id: '5',
    title: 'Charizard ex market analysis - why prices are rising',
    category: 'Market',
    categorySlug: 'market',
    categoryColor: '#F59E0B',
    isPinned: false,
    isLocked: false,
    isHot: false,
    viewCount: 3456,
    replyCount: 78,
    createdAt: '2024-01-14T12:00:00Z',
    lastActivity: '2 hours ago',
    tags: ['charizard', 'market-analysis', 'price-trends'],
    posts: [
      {
        id: 'p1',
        threadId: '5',
        author: {
          username: 'MarketWatcher',
          displayName: 'Market Watcher',
          avatar: '/images/avatars/default.png',
          role: 'vip',
          postCount: 4521,
          reputation: 9800,
          joinDate: '2020-08-15'
        },
        content: `# Why Charizard Cards Are Surging Again

I've been tracking the market closely and noticed a significant uptick in Charizard prices across all eras.

## Key Observations:

1. **Base Set Charizard** - Up 15% in 30 days
2. **Charizard VMAX Rainbow** - Up 25%
3. **Charizard ex (SV3)** - Doubled since release

## Possible Reasons:
- New collectors entering the hobby
- YouTuber influence
- Supply constraints on vintage
- Anticipation of 30th anniversary

This could be a good time to hold, but be cautious of FOMO buying at peaks.

What's your take on the Charizard market?`,
        createdAt: '2024-01-14T12:00:00Z',
        likes: 267,
        likedBy: [],
        isOriginalPost: true
      }
    ]
  },
  '6': {
    id: '6',
    title: 'Best budget deck for local tournaments?',
    category: 'General',
    categorySlug: 'general',
    categoryColor: '#6366F1',
    isPinned: false,
    isLocked: false,
    isHot: false,
    viewCount: 2890,
    replyCount: 92,
    createdAt: '2024-01-13T18:00:00Z',
    lastActivity: '3 hours ago',
    tags: ['competitive', 'budget', 'deck-building', 'tournament'],
    posts: [
      {
        id: 'p1',
        threadId: '6',
        author: {
          username: 'NewPlayer2024',
          displayName: 'New Player',
          avatar: '/images/avatars/default.png',
          role: 'member',
          postCount: 47,
          reputation: 85,
          joinDate: '2024-01-02'
        },
        content: `Hey everyone!

I want to start playing competitively at my local game store but don't have a huge budget.

**Budget:** Around $50-75 for a complete deck

**What I have:** Some random Scarlet & Violet cards from ETBs

Any recommendations for a competitive but affordable deck? I've heard Chien-Pao and Lost Zone are good but they seem expensive.

Thanks in advance!`,
        createdAt: '2024-01-13T18:00:00Z',
        likes: 45,
        likedBy: [],
        isOriginalPost: true
      }
    ]
  },
  '7': {
    id: '7',
    title: 'Complete Guide: How to spot fake Pokemon cards',
    category: 'Articles',
    categorySlug: 'articles',
    categoryColor: '#8B5CF6',
    isPinned: false,
    isLocked: false,
    isHot: true,
    viewCount: 12456,
    replyCount: 234,
    createdAt: '2024-01-10T10:00:00Z',
    lastActivity: '4 hours ago',
    tags: ['guide', 'fake-cards', 'authentication', 'tutorial'],
    posts: [
      {
        id: 'p1',
        threadId: '7',
        author: {
          username: 'AuthenticityPro',
          displayName: 'Authenticity Pro',
          avatar: '/images/avatars/default.png',
          role: 'moderator',
          postCount: 3456,
          reputation: 8900,
          joinDate: '2019-06-20',
          signature: 'Protecting collectors since 2019'
        },
        content: `# The Ultimate Guide to Spotting Fake Pokemon Cards

After authenticating thousands of cards, here's everything you need to know.

## Quick Tests Anyone Can Do:

### 1. The Light Test
Hold the card up to a light. Real cards have a black layer in the middle that blocks light. Fakes often glow through.

### 2. The Rip Test (Use Worthless Cards)
Real Pokemon cards have a black layer when torn. Fakes are solid color.

### 3. Font Check
Look at the HP, attacks, and copyright. Fakes often have:
- Wrong fonts
- Spelling errors
- Incorrect spacing

### 4. Texture Feel
Real holos have a distinct texture pattern. Fakes feel smooth or have wrong patterns.

### 5. Card Back
- Color should be consistent blue
- Pokeball should be centered
- No blurry edges

## Red Flags When Buying:
- Price too good to be true
- Seller has no feedback
- Stock photos only
- Ships from suspicious locations

Stay safe out there, collectors!`,
        createdAt: '2024-01-10T10:00:00Z',
        likes: 892,
        likedBy: [],
        isOriginalPost: true
      }
    ]
  },
  '8': {
    id: '8',
    title: 'TCG Pocket: Best decks for ranked ladder',
    category: 'General',
    categorySlug: 'general',
    categoryColor: '#6366F1',
    isPinned: false,
    isLocked: false,
    isHot: false,
    viewCount: 7823,
    replyCount: 167,
    createdAt: '2024-01-12T14:00:00Z',
    lastActivity: '5 hours ago',
    tags: ['tcg-pocket', 'mobile', 'ranked', 'meta'],
    posts: [
      {
        id: 'p1',
        threadId: '8',
        author: {
          username: 'PocketMaster',
          displayName: 'Pocket Master',
          avatar: '/images/avatars/default.png',
          role: 'member',
          postCount: 892,
          reputation: 2100,
          joinDate: '2023-11-15'
        },
        content: `# Current TCG Pocket Meta - January 2024

Hit Master rank last season and here's what's dominating:

## Tier S
- **Pikachu ex** - Fast, consistent, everyone's nightmare
- **Mewtwo ex** - Energy acceleration is insane

## Tier A
- **Charizard ex** - Strong but slower setup
- **Greninja** - Great into Pikachu

## Tier B
- **Gyarados** - Fun but inconsistent
- **Venusaur ex** - Stall strategy works

## Budget Options
- Arcanine deck - Cheap and effective
- Starmie spread - Great for beginners

What are you all playing this season?`,
        createdAt: '2024-01-12T14:00:00Z',
        likes: 445,
        likedBy: [],
        isOriginalPost: true
      }
    ]
  },
  '9': {
    id: '9',
    title: 'Just pulled a god pack! What are the odds?!',
    category: 'Collecting',
    categorySlug: 'collecting',
    categoryColor: '#10B981',
    isPinned: false,
    isLocked: false,
    isHot: true,
    viewCount: 15678,
    replyCount: 312,
    createdAt: '2024-01-15T02:00:00Z',
    lastActivity: '6 hours ago',
    tags: ['god-pack', 'pulls', 'lucky'],
    posts: [
      {
        id: 'p1',
        threadId: '9',
        author: {
          username: 'LuckyPuller',
          displayName: 'Lucky Puller',
          avatar: '/images/avatars/default.png',
          role: 'member',
          postCount: 234,
          reputation: 560,
          joinDate: '2023-05-10'
        },
        content: `# I CAN'T BELIEVE THIS JUST HAPPENED!!!

Opening my second ever Japanese booster box and I HIT A GOD PACK!

Every single card was a holo or better:
- 2x SAR Cards
- 3x Full Arts
- 5x Holos

I'm literally shaking right now. The odds of this are supposedly 1 in 600 packs?!

Has anyone else hit a god pack? What did you get?

Pics in comments (still processing this!)`,
        createdAt: '2024-01-15T02:00:00Z',
        likes: 1234,
        likedBy: [],
        isOriginalPost: true
      }
    ]
  },
  '10': {
    id: '10',
    title: 'Upcoming set predictions: What comes after Prismatic?',
    category: 'News',
    categorySlug: 'news',
    categoryColor: '#EC4899',
    isPinned: false,
    isLocked: false,
    isHot: false,
    viewCount: 4567,
    replyCount: 89,
    createdAt: '2024-01-14T20:00:00Z',
    lastActivity: '8 hours ago',
    tags: ['predictions', 'future-sets', 'speculation'],
    posts: [
      {
        id: 'p1',
        threadId: '10',
        author: {
          username: 'SetPredictor',
          displayName: 'Set Predictor',
          avatar: '/images/avatars/default.png',
          role: 'member',
          postCount: 1567,
          reputation: 3400,
          joinDate: '2021-03-22'
        },
        content: `# What's Coming After Prismatic Evolutions?

Based on Japanese releases and TCG patterns, here are my predictions:

## Confirmed (Japan):
- **Stellar Crown** - Coming Q2 2024
- Focus on Stellar Pokemon mechanic

## Rumored:
- Legends: Arceus themed set
- Possible Sinnoh remake tie-in
- 30th Anniversary special set

## My Wishlist:
- More Eeveelution love
- Proper Legendary treatment
- Better pull rates (please TPCi!)

What sets are you hoping for? Any chase cards on your radar?`,
        createdAt: '2024-01-14T20:00:00Z',
        likes: 178,
        likedBy: [],
        isOriginalPost: true
      }
    ]
  }
};

// Helper function to get thread by ID
export function getThreadById(id: string): ThreadDetail | undefined {
  return MOCK_THREADS_DETAIL[id];
}

// Get all thread IDs for static generation
export function getAllThreadIds(): string[] {
  return Object.keys(MOCK_THREADS_DETAIL);
}
