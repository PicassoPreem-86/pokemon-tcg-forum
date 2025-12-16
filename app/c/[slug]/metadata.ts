import { Metadata } from 'next';
import { getCategoryBySlug } from '@/lib/categories';
import { SITE_CONFIG } from '@/lib/config';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The category you are looking for does not exist.',
    };
  }

  const title = `${category.name} - ${SITE_CONFIG.name}`;
  const description = category.description;

  return {
    title,
    description,
    keywords: [
      'pokemon tcg',
      category.name.toLowerCase(),
      'pokemon cards',
      'trading cards',
      'pokemon forum',
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_CONFIG.url}/c/${category.slug}`,
      siteName: SITE_CONFIG.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/c/${category.slug}`,
    },
  };
}
