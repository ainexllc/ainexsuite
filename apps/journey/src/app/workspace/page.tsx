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
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">
          Welcome to Journey, {user.displayName ? user.displayName.split(' ')[0] : 'there'}!
        </h2>
        <p className="text-lg text-text-muted">
          Your personal journaling workspace
        </p>
      </div>

      {/* Dashboard Content */}
      <DashboardView dateFilter={dateFilter} />
    </section>
  );
}