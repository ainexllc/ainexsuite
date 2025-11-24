'use client';

import { useSearchParams } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { WorkspacePageHeader } from '@ainexsuite/ui/components';
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
      <WorkspacePageHeader
        title={`Welcome to Journey, ${user.displayName ? user.displayName.split(' ')[0] : 'there'}!`}
        description="Your personal journaling workspace"
      />

      {/* Dashboard Content */}
      <DashboardView dateFilter={dateFilter || undefined} />
    </>
  );
}