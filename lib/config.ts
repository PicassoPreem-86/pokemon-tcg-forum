import { SiteConfig, NavItem } from './types';

export const SITE_CONFIG: SiteConfig = {
  name: 'Pokémon TCG Forum',
  tagline: 'The Ultimate Trading Card Game Community',
  description: 'Join the largest Pokémon TCG community. Discuss cards, deck building, tournaments, trading, collections, and more with fellow trainers.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pokemontcgforum.com',
  twitter: '@pokemontcgforum',
  discord: 'https://discord.gg/pokemontcg',
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
    { label: 'Discord', href: SITE_CONFIG.discord },
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
  { name: 'Twitter', href: 'https://twitter.com/pokemontcgforum', icon: 'twitter' },
  { name: 'Discord', href: SITE_CONFIG.discord, icon: 'discord' },
  { name: 'YouTube', href: 'https://youtube.com/@pokemontcgforum', icon: 'youtube' },
  { name: 'Reddit', href: 'https://reddit.com/r/pokemontcgforum', icon: 'reddit' },
  { name: 'Instagram', href: 'https://instagram.com/pokemontcgforum', icon: 'instagram' },
];

export const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-500 text-white',
  moderator: 'bg-purple-500 text-white',
  vip: 'bg-pikachu-500 text-dark-900',
  member: 'bg-dark-600 text-dark-200',
  newbie: 'bg-green-500 text-white',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  moderator: 'Mod',
  vip: 'VIP',
  member: 'Member',
  newbie: 'New Trainer',
};
