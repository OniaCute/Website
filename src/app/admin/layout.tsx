import React from 'react';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    redirect('/login');
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
