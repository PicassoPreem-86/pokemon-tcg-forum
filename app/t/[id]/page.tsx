import { notFound } from 'next/navigation';
import { getThreadDetailBySlug, incrementThreadViews, getRelatedThreads } from '@/lib/db/thread-queries';
import ThreadView from './components/ThreadView';

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }) {
  const thread = await getThreadDetailBySlug(params.id);

  if (!thread) {
    return {
      title: 'Thread Not Found'
    };
  }

  return {
    title: `${thread.title} | Pokemon TCG Forum`,
    description: thread.excerpt || thread.content.slice(0, 160),
    openGraph: {
      title: thread.title,
      description: thread.excerpt || thread.content.slice(0, 160),
      type: 'article',
      publishedTime: thread.created_at,
      modifiedTime: thread.updated_at,
      authors: [thread.author.display_name || thread.author.username],
    }
  };
}

export default async function ThreadPage({ params }: { params: { id: string } }) {
  // Fetch thread data (slug is passed as 'id' param)
  const thread = await getThreadDetailBySlug(params.id);

  // Handle not found
  if (!thread) {
    notFound();
  }

  // Increment view count (async, don't await)
  incrementThreadViews(thread.id).catch(console.error);

  // Fetch related threads
  const relatedThreads = await getRelatedThreads(thread.id, thread.category_id, 3);

  return <ThreadView thread={thread} relatedThreads={relatedThreads} />;
}
