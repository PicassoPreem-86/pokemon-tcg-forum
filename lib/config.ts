import { SiteConfig, NavItem } from './types';

export const SITE_CONFIG: SiteConfig = {
  name: 'TCG Gossip',
  tagline: 'The Trading Card Community',
  description: 'Join the hottest trading card community. Discuss Pokemon, Yu-Gi-Oh, Magic, sports cards, deck building, tournaments, trading, and more with fellow collectors.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://tcggossip.com',
  twitter: '@tcggossip',
  itemsPerPage: 20,
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Forums', href: '/forums' },
  { label: 'Trading', href: '/trading' },
  { label: 'Deck Building', href: '/deck-building' },
  { label: 'News', href: '/news' },
  { label: 'Price Guides', href: '/price-guides' },
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
