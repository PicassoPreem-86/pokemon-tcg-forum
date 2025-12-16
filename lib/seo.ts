import { Metadata } from 'next';
import { SITE_CONFIG } from './config';

// Base metadata for all pages
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    'pokemon tcg',
    'pokemon cards',
    'trading cards',
    'pokemon forum',
    'deck building',
    'card trading',
    'pokemon community',
    'pokemon collection',
    'card grading',
    'psa grading',
    'pokemon market',
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.twitter,
    images: [`${SITE_CONFIG.url}/images/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification tokens when ready
    // google: 'your-google-verification-token',
    // yandex: 'your-yandex-verification-token',
    // yahoo: 'your-yahoo-verification-token',
  },
  category: 'forum',
};

// Generate page-specific metadata
export function generatePageMetadata(
  title: string,
  description: string,
  path: string,
  options?: {
    keywords?: string[];
    image?: string;
    type?: 'website' | 'article';
    noIndex?: boolean;
  }
): Metadata {
  const url = `${SITE_CONFIG.url}${path}`;
  const imageUrl = options?.image || `${SITE_CONFIG.url}/images/og-image.png`;

  return {
    title,
    description,
    keywords: options?.keywords || [],
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url,
      siteName: SITE_CONFIG.name,
      type: options?.type || 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
    robots: options?.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

// Generate thread metadata
export function generateThreadMetadata(
  title: string,
  excerpt: string,
  slug: string,
  author: string,
  category: string,
  datePublished: string,
  dateModified: string
): Metadata {
  const url = `${SITE_CONFIG.url}/t/${slug}`;

  return {
    title,
    description: excerpt,
    keywords: ['pokemon tcg', category.toLowerCase(), 'discussion', 'forum thread'],
    authors: [{ name: author }],
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description: excerpt,
      url,
      siteName: SITE_CONFIG.name,
      type: 'article',
      publishedTime: datePublished,
      modifiedTime: dateModified,
      authors: [author],
      section: category,
      images: [
        {
          url: `${SITE_CONFIG.url}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_CONFIG.name}`,
      description: excerpt,
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate user profile metadata
export function generateUserMetadata(
  username: string,
  displayName: string,
  bio?: string
): Metadata {
  const description = bio || `${displayName}'s profile on ${SITE_CONFIG.name}. View their posts, collections, and activity.`;
  const url = `${SITE_CONFIG.url}/u/${username}`;

  return {
    title: `${displayName} (@${username})`,
    description,
    openGraph: {
      title: `${displayName} (@${username}) | ${SITE_CONFIG.name}`,
      description,
      url,
      siteName: SITE_CONFIG.name,
      type: 'profile',
      images: [
        {
          url: `${SITE_CONFIG.url}/images/avatars/default.png`,
          width: 400,
          height: 400,
          alt: displayName,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `${displayName} (@${username})`,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate category metadata
export function generateCategoryMetadata(
  name: string,
  description: string,
  slug: string,
  threadCount: number
): Metadata {
  const enhancedDescription = `${description} Browse ${threadCount.toLocaleString()}+ threads about ${name.toLowerCase()} on ${SITE_CONFIG.name}.`;
  const url = `${SITE_CONFIG.url}/c/${slug}`;

  return {
    title: name,
    description: enhancedDescription,
    keywords: ['pokemon tcg', name.toLowerCase(), 'forum', 'discussion', 'community'],
    openGraph: {
      title: `${name} | ${SITE_CONFIG.name}`,
      description: enhancedDescription,
      url,
      siteName: SITE_CONFIG.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | ${SITE_CONFIG.name}`,
      description: enhancedDescription,
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate tag metadata
export function generateTagMetadata(tag: string, threadCount: number): Metadata {
  const title = `#${tag}`;
  const description = `Browse ${threadCount} threads tagged with #${tag} on ${SITE_CONFIG.name}. Join the discussion about ${tag.replace(/-/g, ' ')} in the Pokemon TCG community.`;
  const url = `${SITE_CONFIG.url}/tag/${tag}`;

  return {
    title,
    description,
    keywords: ['pokemon tcg', tag, 'forum tag', 'discussion'],
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url,
      siteName: SITE_CONFIG.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate search page metadata
export function generateSearchMetadata(query?: string): Metadata {
  const title = query ? `Search: "${query}"` : 'Search';
  const description = query
    ? `Search results for "${query}" on ${SITE_CONFIG.name}.`
    : `Search threads, users, and content on ${SITE_CONFIG.name}.`;
  const url = `${SITE_CONFIG.url}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url,
      siteName: SITE_CONFIG.name,
      type: 'website',
    },
    robots: {
      index: false, // Don't index search results pages
      follow: true,
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/search`,
    },
  };
}

// Generate card database metadata
export function generateCardDatabaseMetadata(): Metadata {
  return {
    title: 'Pokemon Card Database',
    description: 'Browse our comprehensive Pokemon card database. Search cards by name, set, rarity, and price. Find card values and collection information.',
    keywords: [
      'pokemon cards',
      'card database',
      'pokemon tcg',
      'card prices',
      'card values',
      'base set',
      'charizard',
      'pikachu',
    ],
    openGraph: {
      title: `Pokemon Card Database | ${SITE_CONFIG.name}`,
      description: 'Browse our comprehensive Pokemon card database. Search cards by name, set, rarity, and price.',
      url: `${SITE_CONFIG.url}/cards`,
      siteName: SITE_CONFIG.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Pokemon Card Database | ${SITE_CONFIG.name}`,
      description: 'Browse our comprehensive Pokemon card database. Search cards by name, set, rarity, and price.',
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/cards`,
    },
  };
}
