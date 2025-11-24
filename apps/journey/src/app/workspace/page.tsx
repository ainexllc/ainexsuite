'use client';

import { useSearchParams } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export default function WorkspacePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const dateFilter = searchParams.get('date');

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Dashboard Content */}
      <DashboardView dateFilter={dateFilter || undefined} />
    </>
  );
}