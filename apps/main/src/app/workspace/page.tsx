'use client';

// Use shared navigation icons from the sidebar
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';

import { ActivityPanel } from '@/components/activity-panel';
import UniversalSearch from '@/components/universal-search';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import {
  Loader2,
  StickyNote,
  Map,
  CheckSquare,
  TrendingUp,
  Camera,
  Sprout,
  HeartPulse,
  Dumbbell,
  Briefcase,
  Workflow,
  Shield as AdminIcon
} from 'lucide-react';
import { SmartGrid } from '@/components/smart-dashboard/smart-grid';
import { MarketingSlideshow } from '@/components/workspace/marketing-slideshow';
import { SUITE_APPS, getAppUrl } from '@ainexsuite/ui';

// Environment-aware app URLs
const isDev = process.env.NODE_ENV === 'development';

// Map Lucide icons to shared app configuration (same as navigation sidebar)
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  notes: StickyNote,
  journey: Map,
  todo: CheckSquare,
  track: TrendingUp,
  moments: Camera,
  grow: Sprout,
  pulse: HeartPulse,
  fit: Dumbbell,
  projects: Briefcase,
  workflow: Workflow,
  admin: AdminIcon,
};

// Build apps array from shared configuration with icons
const apps = Object.entries(SUITE_APPS).map(([slug, config]) => ({
  name: config.name,
  slug: config.slug,
  description: config.description,
  icon: iconMap[slug] || Briefcase,
  color: config.color,
  url: getAppUrl(slug, isDev),
}));

export default function WorkspacePage() {
  const { user, loading, signOut, bootstrapStatus, ssoInProgress } = useAuth();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'activity' | 'settings' | 'ai-assistant' | null>(null);

  // Redirect to login if not authenticated
  // Wait for bootstrap and SSO to complete before redirecting to prevent interrupting auto-login
  useEffect(() => {
    if (!loading && !ssoInProgress && !user && bootstrapStatus !== 'running') {
      router.push('/');
    }
  }, [user, loading, ssoInProgress, bootstrapStatus, router]);

  // Cmd+K / Ctrl+K keyboard shortcut for search
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

  // Escape key handler for panels
  useEffect(() => {
    if (!activePanel) {
      return;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePanel(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activePanel]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Show loading while authenticating, bootstrapping, or SSO in progress
  if (loading || ssoInProgress || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dark relative isolate min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Atmospheric glows */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#f97316]/40 blur-[150px]" />
      <div className="pointer-events-none absolute top-1/3 right-[-12%] h-[460px] w-[460px] rounded-full bg-[#ea580c]/30 blur-[160px]" />

      <WorkspaceLayout
        user={user}
        onSignOut={handleSignOut}
        appName="Suite"
        appColor="#f97316"
        showBackground={false}
        apps={apps}
        onSettingsClick={() => setActivePanel('settings')}
        onActivityClick={() => setActivePanel('activity')}
      >
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Marketing Slideshow */}
          <section>
            <MarketingSlideshow />
          </section>

          {/* AI Insights Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">AI Insights</h3>
            <div className="rounded-xl border border-border bg-foreground/5 backdrop-blur p-6 min-h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">AI insights coming soon...</p>
            </div>
          </section>

          {/* Welcome Section with Dashboard */}
          {/* Smart Dashboard Grid */}
          <SmartGrid />
        </div>
      </WorkspaceLayout>

      {/* Right panel overlay */}
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

      {/* Universal Search Modal */}
      <UniversalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}