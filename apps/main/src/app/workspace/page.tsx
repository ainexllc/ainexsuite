'use client';

// Custom SVG app icons for workspace navigation
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';

import { ActivityPanel } from '@/components/activity-panel';
import UniversalSearch from '@/components/universal-search';
import { WorkspaceLayout, WorkspacePageHeader } from '@ainexsuite/ui/components';
import { useVisualStyle } from '@/lib/theme/visual-style';
import { useAllAppColors } from '@ainexsuite/theme';
import { Loader2, Settings as AdminIcon } from 'lucide-react';
import { SmartGrid } from '@/components/smart-dashboard/smart-grid';
import { AppsNavVision } from '@/components/workspace/apps-nav-vision';
import { NotesIcon } from '@/components/icons/notes-icon';
import { JourneyIcon } from '@/components/icons/journey-icon';
import { TasksIcon } from '@/components/icons/tasks-icon';
import { TrackIcon } from '@/components/icons/track-icon';
import { MomentsIcon } from '@/components/icons/moments-icon';
import { GrowIcon } from '@/components/icons/grow-icon';
import { PulseIcon } from '@/components/icons/pulse-icon';
import { FitIcon } from '@/components/icons/fit-icon';
import { ProjectsIcon } from '@/components/icons/projects-icon';
import { WorkflowIcon } from '@/components/icons/workflow-icon';
import { SUITE_APPS, getAppUrl } from '@ainexsuite/ui';

// Environment-aware app URLs
const isDev = process.env.NODE_ENV === 'development';

// Map custom icons to shared app configuration
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  notes: NotesIcon,
  journey: JourneyIcon,
  todo: TasksIcon,
  track: TrackIcon,
  moments: MomentsIcon,
  grow: GrowIcon,
  pulse: PulseIcon,
  fit: FitIcon,
  projects: ProjectsIcon,
  workflow: WorkflowIcon,
  admin: AdminIcon,
};

// Build apps array from shared configuration with icons
const apps = Object.entries(SUITE_APPS).map(([slug, config]) => ({
  name: config.name,
  slug: config.slug,
  description: config.description,
  icon: iconMap[slug] || AdminIcon,
  color: config.color,
  url: getAppUrl(slug, isDev),
}));

export default function WorkspacePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { selectedVariant } = useVisualStyle();
  const { colors: appColors } = useAllAppColors();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'activity' | 'settings' | 'ai-assistant' | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Combine apps with installation status and dynamic colors
  const allAppsWithStatus = apps.map(app => {
    const dynamicColors = appColors[app.slug];
    return {
      ...app,
      // Use dynamic colors if available, otherwise keep legacy gradient classes
      primaryColor: dynamicColors?.primary,
      secondaryColor: dynamicColors?.secondary,
      isInstalled: !!user?.appsUsed?.[app.slug as keyof typeof user.appsUsed],
      isLocked: false // Default to unlocked/available for now
    };
  }).sort((a, b) => (a.isInstalled === b.isInstalled ? 0 : a.isInstalled ? -1 : 1)); // Installed first

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

  if (loading) {
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
    <div className="dark relative isolate min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <div className={`pointer-events-none absolute inset-0 -z-10 ${selectedVariant.heroAtmosphere}`} />
      {/* Theme-aware atmospheric glows */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-[150px]"
        style={{
          backgroundColor: selectedVariant.id === 'ember-glow'
            ? 'rgba(249, 115, 22, 0.4)'
            : 'rgba(56, 189, 248, 0.35)'
        }}
      />
      <div
        className="pointer-events-none absolute top-1/3 right-[-12%] h-[460px] w-[460px] rounded-full blur-[160px]"
        style={{
          backgroundColor: selectedVariant.id === 'ember-glow'
            ? 'rgba(234, 88, 12, 0.3)'
            : 'rgba(14, 165, 233, 0.25)'
        }}
      />

      <WorkspaceLayout
        user={user}
        onSignOut={handleSignOut}
        appName="Suite"
        appColor={selectedVariant.id === 'ember-glow' ? '#f97316' : '#38bdf8'}
        showGlows={false} // We handle our own atmospheric glows
        apps={apps}
        onSettingsClick={() => setActivePanel('settings')}
        onActivityClick={() => setActivePanel('activity')}
      >
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Apps Placeholder Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Apps</h3>
            <AppsNavVision apps={allAppsWithStatus} />
          </section>

          {/* AI Insights Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide">AI Insights</h3>
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6 min-h-[200px] flex items-center justify-center">
              <p className="text-white/50">AI insights coming soon...</p>
            </div>
          </section>

          {/* Welcome Section with Dashboard */}
          <WorkspacePageHeader
            title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${user.displayName?.split(' ')[0] || 'there'}!`}
            description="Here is your daily briefing."
          >
            {/* Smart Dashboard Grid */}
            <SmartGrid />
          </WorkspacePageHeader>
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