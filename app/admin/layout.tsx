import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin-check';
import AdminLayoutClient from './layout-client';

// Note: Icons are resolved in the client component (can't serialize React components)
const adminNavItems = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Content', href: '/admin/content' },
  { name: 'Categories', href: '/admin/categories' },
  { name: 'Reports', href: '/admin/reports' },
  { name: 'Audit Log', href: '/admin/audit-log' },
  { name: 'Analytics', href: '/admin/analytics' },
  { name: 'Settings', href: '/admin/settings' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SERVER-SIDE AUTHENTICATION CHECK
  // This runs before any client code and protects all admin routes
  let adminProfile;
  try {
    adminProfile = await requireAdmin('/admin');
  } catch (error) {
    // requireAdmin will redirect automatically, but catch any unexpected errors
    console.error('Admin layout auth error:', error);
    redirect('/login?error=unauthorized');
  }

  // If we get here, user is authenticated and has admin/moderator role
  return (
    <AdminLayoutClient
      adminProfile={adminProfile}
      adminNavItems={adminNavItems}
    >
      {children}
    </AdminLayoutClient>
  );
}
