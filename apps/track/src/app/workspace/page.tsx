'use client';

import { useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui';
import { Plus, LayoutGrid, List, Calendar } from 'lucide-react';
import { SubscriptionList } from '@/components/SubscriptionList';
import { SmartSubscriptionInput } from '@/components/SmartSubscriptionInput';
import { SubscriptionInsights } from '@/components/SubscriptionInsights';
import { useRouter } from 'next/navigation';

export default function WorkspacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<'list' | 'calendar' | 'analytics'>('list');

  if (loading) return null; // Or loading spinner

  if (!user) {
    router.push('/');
    return null;
  }

  const handleSignOut = async () => {
    const { auth } = await import('@ainexsuite/firebase');
    await auth.signOut();
    router.push('/');
  };

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      appName="Track"
      appColor="#10b981"
      searchPlaceholder="Search subscriptions..."
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* AI Insights */}
        <SubscriptionInsights />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Overview</h1>
            <p className="text-zinc-400">Manage your recurring expenses</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggles */}
            <div className="flex bg-zinc-900 border border-white/10 rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`p-2 rounded-md transition-colors ${view === 'calendar' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`p-2 rounded-md transition-colors ${view === 'analytics' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20">
              <Plus className="h-4 w-4" />
              Add Subscription
            </button>
          </div>
        </div>

        {/* Smart Input */}
        <SmartSubscriptionInput />

        {/* Content */}
        <SubscriptionList />
      </div>
    </WorkspaceLayout>
  );
}
