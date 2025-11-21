'use client';

// Custom SVG app icons for workspace navigation
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';

import { ActivityPanel } from '@/components/activity-panel';
import UniversalSearch from '@/components/universal-search';
import { WorkspaceLayout, NavigationPanel } from '@ainexsuite/ui/components';
import { useVisualStyle } from '@/lib/theme/visual-style';
import { useAllAppColors } from '@ainexsuite/theme';
import {
  Settings,
  Activity as ActivityIcon,
  RefreshCw,
  Loader2
} from 'lucide-react';
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

// Environment-aware app URLs
const isDev = process.env.NODE_ENV === 'development';

const apps = [
  {
    name: 'Notes',
    slug: 'notes',
    description: 'Quickly capture thoughts, ideas, and meeting notes. AI-powered organization.',
    icon: NotesIcon,
    color: 'from-blue-500 to-blue-600',
    url: isDev ? 'http://localhost:3001' : 'https://notes.ainexsuite.com',
  },
  {
    name: 'Journey',
    slug: 'journey',
    description: 'Reflect on your daily experiences with guided prompts and mood tracking.',
    icon: JourneyIcon,
    color: 'from-purple-500 to-purple-600',
    url: isDev ? 'http://localhost:3002' : 'https://journey.ainexsuite.com',
  },
  {
    name: 'Tasks',
    slug: 'todo',
    description: 'Manage to-dos and projects. Never miss a deadline with smart priorities.',
    icon: TasksIcon,
    color: 'from-green-500 to-green-600',
    url: isDev ? 'http://localhost:3003' : 'https://tasks.ainexsuite.com',
  },
  {
    name: 'Track',
    slug: 'track',
    description: 'Build better habits with visual streaks and progress analytics.',
    icon: TrackIcon,
    color: 'from-orange-500 to-orange-600',
    url: isDev ? 'http://localhost:3004' : 'https://track.ainexsuite.com',
  },
  {
    name: 'Moments',
    slug: 'moments',
    description: 'Capture life\'s beautiful moments. Create a visual timeline of memories.',
    icon: MomentsIcon,
    color: 'from-yellow-500 to-yellow-600',
    url: isDev ? 'http://localhost:3005' : 'https://moments.ainexsuite.com',
  },
  {
    name: 'Grow',
    slug: 'grow',
    description: 'Track your learning journey, set goals, and master new skills.',
    icon: GrowIcon,
    color: 'from-teal-500 to-teal-600',
    url: isDev ? 'http://localhost:3007' : 'https://grow.ainexsuite.com',
  },
  {
    name: 'Pulse',
    slug: 'pulse',
    description: 'Monitor health metrics, wellness trends, and vital signs.',
    icon: PulseIcon,
    color: 'from-red-500 to-red-600',
    url: isDev ? 'http://localhost:3010' : 'https://pulse.ainexsuite.com',
  },
  {
    name: 'Fit',
    slug: 'fit',
    description: 'Record workouts and track fitness progress. Visualize your gains.',
    icon: FitIcon,
    color: 'from-blue-500 to-blue-600',
    url: isDev ? 'http://localhost:3006' : 'https://fit.ainexsuite.com',
  },
  {
    name: 'Projects',
    slug: 'projects',
    description: 'Visual whiteboard with sticky notes for creative team collaboration.',
    icon: ProjectsIcon,
    color: 'from-pink-500 to-pink-600',
    url: isDev ? 'http://localhost:3009' : 'https://projects.ainexsuite.com',
  },
  {
    name: 'Workflow',
    slug: 'workflow',
    description: 'Build and automate visual workflows with drag-and-drop simplicity.',
    icon: WorkflowIcon,
    color: 'from-cyan-500 to-cyan-600',
    url: isDev ? 'http://localhost:3011' : 'https://workflow.ainexsuite.com',
  },
];

export default function WorkspacePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { selectedVariant } = useVisualStyle();
  const { colors: appColors } = useAllAppColors();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
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
    if (!isNavOpen && !activePanel) {
      return;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activePanel) {
          setActivePanel(null);
        } else if (isNavOpen) {
          setIsNavOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isNavOpen, activePanel]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const profileMenuItems = [
    {
      icon: <Settings className="h-4 w-4" />,
      label: "Settings",
      onClick: () => {
        setActivePanel('settings');
      },
    },
    {
      icon: <ActivityIcon className="h-4 w-4" />,
      label: "Activity",
      onClick: () => {
        setActivePanel('activity');
      },
    },
    {
      icon: <RefreshCw className="h-4 w-4" />,
      label: "Refresh",
      onClick: () => {
        router.refresh();
      },
    },
  ];

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
        showNavigationButton={true}
        onNavigationToggle={() => setIsNavOpen(!isNavOpen)}
        profileMenuItems={profileMenuItems}
        showGlows={false} // We handle our own atmospheric glows
      >
        {/* Top Apps Navigation */}
        <AppsNavVision apps={allAppsWithStatus} />

        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.displayName?.split(' ')[0] || 'there'}!
            </h2>
            <p className="text-lg text-white/70">
              Here is your daily briefing.
            </p>
          </div>

          {/* Smart Dashboard Grid */}
          <SmartGrid />
        </div>
      </WorkspaceLayout>

      {/* Navigation overlay panel */}
      {isNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-overlay/60 backdrop-blur-sm"
          onClick={() => setIsNavOpen(false)}
        />
      )}
      <NavigationPanel isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

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