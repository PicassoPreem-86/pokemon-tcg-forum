import { getReports, getReportStats } from '@/lib/actions/reports';
import ReportsPageClient from './page-client';

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Reports | Admin Panel',
  description: 'Manage user reports',
};

export default async function ReportsPage() {
  // Fetch initial data server-side
  const [reportsResult, statsResult] = await Promise.all([
    getReports({ limit: 50 }),
    getReportStats(),
  ]);

  const initialReports = reportsResult.success ? reportsResult.data?.reports || [] : [];
  const initialTotal = reportsResult.success ? reportsResult.data?.total || 0 : 0;
  const stats = statsResult.success && statsResult.data ? statsResult.data : null;

  return (
    <ReportsPageClient
      initialReports={initialReports}
      initialTotal={initialTotal}
      stats={stats}
    />
  );
}
