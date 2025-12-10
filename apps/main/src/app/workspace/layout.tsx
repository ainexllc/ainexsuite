'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { Loader2 } from 'lucide-react';
import { ActivityPanel } from '@/components/activity-panel';
import UniversalSearch from '@/components/universal-search';
import { getQuickActionsForApp } from '@ainexsuite/types';

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut, bootstrapStatus, ssoInProgress } = useAuth();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'activity' | 'settings' | 'ai-assistant' | null>(null);

  // Get quick actions for Main app
  const quickActions = getQuickActionsForApp('main');

  // Redirect logic
  useEffect(() => {
    if (!loading && !ssoInProgress && !user && bootstrapStatus !== 'running') {
      router.push('/');
    }
  }, [user, loading, ssoInProgress, bootstrapStatus, router]);

  // Cmd+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Escape key for panels
  useEffect(() => {
    if (!activePanel) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActivePanel(null);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activePanel]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Handle search trigger from header
  const handleSearchClick = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  // Handle quick actions
  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'go-to-app':
        setIsSearchOpen(true);
        break;
      default:
        break;
    }
  }, []);

  // Handle AI assistant
  const handleAiAssistantClick = useCallback(() => {
    setActivePanel('ai-assistant');
  }, []);

  if (loading || ssoInProgress || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dark relative isolate min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Atmospheric glows - kept here as they seem specific to Main's look, but placed under layout control */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#f97316]/40 blur-[150px]" />
      <div className="pointer-events-none absolute top-1/3 right-[-12%] h-[460px] w-[460px] rounded-full bg-[#ea580c]/30 blur-[160px]" />

      <WorkspaceLayout
        user={user}
        onSignOut={handleSignOut}
        appName="Suite"
        appColor="#f97316"
        showBackground={false}
        onSettingsClick={() => setActivePanel('settings')}
        onActivityClick={() => setActivePanel('activity')}
        // New props
        onSearchClick={handleSearchClick}
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        onAiAssistantClick={handleAiAssistantClick}
        notifications={[]}
      >
        {children}
      </WorkspaceLayout>

      {/* Panels */}
      {activePanel && (
        <div
          className="fixed inset-0 z-30 bg-overlay/60 backdrop-blur-sm"
          onClick={() => setActivePanel(null)}
        />
      )}
      <ActivityPanel
        isOpen={!!activePanel}
        activeView={activePanel}
        onClose={() => setActivePanel(null)}
      />

      <UniversalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}