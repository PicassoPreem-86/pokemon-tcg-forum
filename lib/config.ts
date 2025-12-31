import { SiteConfig, NavItem } from './types';

export const SITE_CONFIG: SiteConfig = {
  name: 'TCG Gossip',
  tagline: 'The Trading Card Community',
  description: 'Join the premier trading card community. Discuss all TCGs - Pokemon, Yu-Gi-Oh, Magic, sports cards, and more. Share collections, market insights, grading tips, and best pulls with fellow collectors.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://tcggossip.com',
  twitter: '@tcggossip',
  itemsPerPage: 20,
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Forums', href: '/forums' },
  { label: 'News', href: '/news' },
  { label: 'Card Database', href: '/cards' },
];

export const FOOTER_LINKS = {
  community: [
    { label: 'Forums', href: '/forums' },
    { label: 'Members', href: '/members' },
  ],
  resources: [
    { label: 'Price Guides', href: '/price-guides' },
    { label: 'Deck Builder', href: '/deck-building' },
    { label: 'Card Database', href: '/cards' },
  ],
  support: [
    { label: 'About', href: '/about' },
    { label: 'Rules', href: '/rules' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

export const SOCIAL_LINKS = [
  { name: 'Twitter', href: 'https://twitter.com/tcggossip', icon: 'twitter' },
  { name: 'YouTube', href: 'https://youtube.com/@tcggossip', icon: 'youtube' },
  { name: 'Reddit', href: 'https://reddit.com/r/tcggossip', icon: 'reddit' },
  { name: 'Instagram', href: 'https://instagram.com/tcggossip', icon: 'instagram' },
];

export const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-500 text-white',
  moderator: 'bg-purple-500 text-white',
  vip: 'bg-purple-500 text-white',
  member: 'bg-dark-600 text-dark-200',
  newbie: 'bg-green-500 text-white',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  moderator: 'Mod',
  vip: 'VIP',
  member: 'Member',
  newbie: 'New Collector',
};

// Multi-Game Configuration (Pokemon + One Piece)
export interface GameConfig {
  name: string;
  shortName: string;
  icon: string;
  color: string;
  slug: string;
  description: string;
}

export const SUPPORTED_GAMES: Record<string, GameConfig> = {
  pokemon: {
    name: 'Pokemon TCG',
    shortName: 'Pokemon',
    icon: '⚡',
    color: '#FFCB05',
    slug: 'pokemon',
    description: 'Catch \'em all! Pokemon Trading Card Game discussion and collecting'
  },
  onepiece: {
    name: 'One Piece TCG',
    shortName: 'One Piece',
    icon: '🏴‍☠️',
    color: '#FF6B35',
    slug: 'onepiece',
    description: 'Set sail! One Piece Card Game strategies and collection'
  }
};

export const DEFAULT_GAME = 'all'; // Show all games by default

export const GAME_ORDER = ['pokemon', 'onepiece'] as const;
