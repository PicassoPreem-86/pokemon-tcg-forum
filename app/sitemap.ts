import { MetadataRoute } from 'next';
import { MOCK_THREADS } from '@/lib/mock-data/threads';
import { CATEGORIES } from '@/lib/categories';
import { MOCK_USERS } from '@/lib/mock-data/users';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokemontcgforum.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/cards`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/new`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/rules`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/wiki`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/groups`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${BASE_URL}/c/${category.slug}`,
    lastModified: currentDate,
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  // Thread pages
  const threadPages: MetadataRoute.Sitemap = MOCK_THREADS.map((thread) => ({
    url: `${BASE_URL}/t/${thread.slug}`,
    lastModified: thread.updatedAt,
    changeFrequency: 'hourly' as const,
    priority: thread.isPinned ? 0.85 : thread.isHot ? 0.8 : 0.7,
  }));

  // User profile pages
  const userPages: MetadataRoute.Sitemap = MOCK_USERS.map((user) => ({
    url: `${BASE_URL}/u/${user.username}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // Tag pages (extract unique tags from threads)
  const allTags = new Set<string>();
  MOCK_THREADS.forEach((thread) => {
    if (thread.tags) {
      thread.tags.forEach((tag) => allTags.add(tag));
    }
  });

  const tagPages: MetadataRoute.Sitemap = Array.from(allTags).map((tag) => ({
    url: `${BASE_URL}/tag/${tag}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...threadPages,
    ...userPages,
    ...tagPages,
  ];
}
