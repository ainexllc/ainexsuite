'use client';

import { useState } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { LayoutGrid, List, Calendar } from 'lucide-react';
import { WorkspacePageLayout } from '@ainexsuite/ui';
import { SubscriptionList } from '@/components/SubscriptionList';
import { SmartSubscriptionInput } from '@/components/SmartSubscriptionInput';
import { SubscriptionInsights } from '@/components/SubscriptionInsights';

export default function WorkspacePage() {
  const { user } = useWorkspaceAuth();
  const [view, setView] = useState<'list' | 'calendar' | 'analytics'>('list');

  if (!user) return null;

  return (
    <WorkspacePageLayout
      insightsBanner={<SubscriptionInsights />}
      composer={<SmartSubscriptionInput />}
      composerActions={
        <div className="flex bg-zinc-900 border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`p-2 rounded-md transition-colors ${view === 'calendar' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            aria-label="Calendar view"
          >
            <Calendar className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('analytics')}
            className={`p-2 rounded-md transition-colors ${view === 'analytics' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            aria-label="Analytics view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <SubscriptionList />
    </WorkspacePageLayout>
  );
}