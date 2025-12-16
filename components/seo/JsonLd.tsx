import { SITE_CONFIG } from '@/lib/config';
import { FORUM_STATS } from '@/lib/categories';

// Organization Schema
export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/images/pikachu-logo.png`,
    sameAs: [
      'https://twitter.com/pokemontcgforum',
      'https://discord.gg/pokemontcg',
      'https://youtube.com/@pokemontcgforum',
      'https://reddit.com/r/pokemontcgforum',
      'https://instagram.com/pokemontcgforum',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${SITE_CONFIG.url}/contact`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Website Schema with SearchAction
export function WebsiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Discussion Forum Schema (for main forum page)
export function DiscussionForumJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    '@id': SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    audience: {
      '@type': 'Audience',
      audienceType: 'Pokemon TCG Players and Collectors',
    },
    about: {
      '@type': 'Thing',
      name: 'Pokemon Trading Card Game',
      description: 'Discussion about Pokemon Trading Card Game collecting, trading, deck building, and tournaments',
    },
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: FORUM_STATS.totalPosts,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/FollowAction',
        userInteractionCount: FORUM_STATS.totalMembers,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Thread/Post Schema
interface ThreadJsonLdProps {
  title: string;
  slug: string;
  author: string;
  datePublished: string;
  dateModified: string;
  excerpt: string;
  replyCount: number;
  viewCount: number;
  categoryName: string;
}

export function ThreadJsonLd({
  title,
  slug,
  author,
  datePublished,
  dateModified,
  excerpt,
  replyCount,
  viewCount,
  categoryName,
}: ThreadJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: title,
    articleBody: excerpt,
    url: `${SITE_CONFIG.url}/t/${slug}`,
    datePublished,
    dateModified,
    author: {
      '@type': 'Person',
      name: author,
      url: `${SITE_CONFIG.url}/u/${author.toLowerCase().replace(/\s+/g, '-')}`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/images/pikachu-logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/t/${slug}`,
    },
    discussionUrl: `${SITE_CONFIG.url}/t/${slug}`,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: replyCount,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ViewAction',
        userInteractionCount: viewCount,
      },
    ],
    about: {
      '@type': 'Thing',
      name: categoryName,
    },
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Category/Forum Section Schema
interface CategoryJsonLdProps {
  name: string;
  slug: string;
  description: string;
  threadCount: number;
  postCount: number;
}

export function CategoryJsonLd({
  name,
  slug,
  description,
  threadCount,
  postCount,
}: CategoryJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${name} - ${SITE_CONFIG.name}`,
    description,
    url: `${SITE_CONFIG.url}/c/${slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    about: {
      '@type': 'Thing',
      name,
      description,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: threadCount,
      itemListElement: {
        '@type': 'DiscussionForumPosting',
        '@id': `${SITE_CONFIG.url}/c/${slug}`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// User Profile Schema
interface UserProfileJsonLdProps {
  username: string;
  displayName: string;
  bio?: string;
  joinDate: string;
  postCount: number;
}

export function UserProfileJsonLd({
  username,
  displayName,
  bio,
  joinDate,
  postCount,
}: UserProfileJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: displayName,
      alternateName: username,
      description: bio,
      url: `${SITE_CONFIG.url}/u/${username}`,
      memberOf: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
      },
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/WriteAction',
        userInteractionCount: postCount,
      },
    },
    dateCreated: joinDate,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema (for FAQ page)
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_CONFIG.url}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Product Schema (for Card Database)
interface CardProductJsonLdProps {
  name: string;
  set: string;
  number: string;
  rarity: string;
  price: number;
  image?: string;
}

export function CardProductJsonLd({
  name,
  set,
  number,
  rarity,
  price,
  image,
}: CardProductJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${name} - ${set} ${number}`,
    description: `${rarity} Pokemon card from ${set}`,
    image: image || `${SITE_CONFIG.url}/images/cards/placeholder.png`,
    brand: {
      '@type': 'Brand',
      name: 'Pokemon',
    },
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    category: 'Trading Cards',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Combined Homepage Schema (includes all main schemas)
export function HomepageJsonLd() {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <DiscussionForumJsonLd />
    </>
  );
}
