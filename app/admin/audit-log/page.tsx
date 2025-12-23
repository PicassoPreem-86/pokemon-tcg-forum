import { getAuditLogs, getAuditLogStats } from '@/lib/actions/audit-log';
import AuditLogPageClient from './page-client';

export const metadata = {
  title: 'Audit Log | Admin Panel',
  description: 'View admin action audit logs',
};

export default async function AuditLogPage() {
  // Fetch initial data server-side
  const [logsResult, statsResult] = await Promise.all([
    getAuditLogs({ limit: 50 }),
    getAuditLogStats(),
  ]);

  const initialLogs = logsResult.success ? logsResult.data?.logs || [] : [];
  const initialTotal = logsResult.success ? logsResult.data?.total || 0 : 0;
  const stats = statsResult.success && statsResult.data ? statsResult.data : null;

  return (
    <AuditLogPageClient
      initialLogs={initialLogs}
      initialTotal={initialTotal}
      stats={stats}
    />
  );
}
