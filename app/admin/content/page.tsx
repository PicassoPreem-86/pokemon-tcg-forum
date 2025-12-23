import { getAdminContent, getContentStats } from '@/lib/actions/content';
import ContentPageClient from './page-client';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  // Fetch initial data server-side
  const [contentResult, statsResult] = await Promise.all([
    getAdminContent({ limit: 50 }),
    getContentStats(),
  ]);

  const initialContent = contentResult.success && contentResult.data
    ? contentResult.data.content
    : [];

  const initialTotal = contentResult.success && contentResult.data
    ? contentResult.data.total
    : 0;

  const stats = statsResult.success && statsResult.data
    ? statsResult.data
    : null;

  return (
    <ContentPageClient
      initialContent={initialContent}
      initialTotal={initialTotal}
      stats={stats}
    />
  );
}
