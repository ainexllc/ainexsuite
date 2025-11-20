'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { NavigationPanel } from '@/components/navigation-panel';
import { ActivityPanel } from '@/components/activity-panel';
import UniversalSearch from '@/components/universal-search';
import ActivityFeed from '@/components/activity-feed';
import { AinexStudiosLogo } from '@ainexsuite/ui/components';
import { useVisualStyle } from '@/lib/theme/visual-style';
import { useAllAppColors } from '@ainexsuite/theme';
import Image from 'next/image';
import {
  FileText,
  BookOpen,
  CheckSquare,
  TrendingUp,
  Camera,
  GraduationCap,
  Activity as ActivityIcon,
  Dumbbell,
  Loader2,
  Search,
  Menu,
  X,
  ChevronDown,
  Layers,
  GitBranch
} from 'lucide-react';
import { Footer } from '@/components/footer';
import { SmartGrid } from '@/components/smart-dashboard/smart-grid';
import { AppsNavVision } from '@/components/workspace/apps-nav-vision';

// Environment-aware app URLs
const isDev = process.env.NODE_ENV === 'development';

const apps = [
  {
    name: 'Notes',
    slug: 'notes',
    description: 'Quickly capture thoughts, ideas, and meeting notes. AI-powered organization.',
    icon: FileText,
    color: 'from-yellow-500 to-orange-500',
    url: isDev ? 'http://localhost:3001' : 'https://notes.ainexsuite.com',
  },
  {
    name: 'Journey',
    slug: 'journey',
    description: 'Reflect on your daily experiences with guided prompts and mood tracking.',
    icon: BookOpen,
    color: 'from-purple-500 to-pink-500',
    url: isDev ? 'http://localhost:3002' : 'https://journey.ainexsuite.com',
  },
  {
    name: 'Tasks',
    slug: 'todo',
    description: 'Manage to-dos and projects. Never miss a deadline with smart priorities.',
    icon: CheckSquare,
    color: 'from-blue-500 to-cyan-500',
    url: isDev ? 'http://localhost:3003' : 'https://tasks.ainexsuite.com',
  },
  {
    name: 'Track',
    slug: 'track',
    description: 'Build better habits with visual streaks and progress analytics.',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    url: isDev ? 'http://localhost:3004' : 'https://track.ainexsuite.com',
  },
  {
    name: 'Moments',
    slug: 'moments',
    description: 'Capture life\'s beautiful moments. Create a visual timeline of memories.',
    icon: Camera,
    color: 'from-pink-500 to-rose-500',
    url: isDev ? 'http://localhost:3005' : 'https://moments.ainexsuite.com',
  },
  {
    name: 'Grow',
    slug: 'grow',
    description: 'Track your learning journey, set goals, and master new skills.',
    icon: GraduationCap,
    color: 'from-indigo-500 to-purple-500',
    url: isDev ? 'http://localhost:3006' : 'https://grow.ainexsuite.com',
  },
  {
    name: 'Pulse',
    slug: 'pulse',
    description: 'Monitor health metrics, wellness trends, and vital signs.',
    icon: ActivityIcon,
    color: 'from-red-500 to-orange-500',
    url: isDev ? 'http://localhost:3007' : 'https://pulse.ainexsuite.com',
  },
  {
    name: 'Fit',
    slug: 'fit',
    description: 'Record workouts and track fitness progress. Visualize your gains.',
    icon: Dumbbell,
    color: 'from-orange-500 to-amber-500',
    url: isDev ? 'http://localhost:3008' : 'https://fit.ainexsuite.com',
  },
  {
    name: 'Projects',
    slug: 'projects',
    description: 'Visual whiteboard with sticky notes for creative team collaboration.',
    icon: Layers,
    color: 'from-violet-500 to-purple-500',
    url: isDev ? 'http://localhost:3009' : 'https://projects.ainexsuite.com',
  },
  {
    name: 'Workflow',
    slug: 'workflow',
    description: 'Build and automate visual workflows with drag-and-drop simplicity.',
    icon: GitBranch,
    color: 'from-purple-600 to-indigo-600',
    url: isDev ? 'http://localhost:3010' : 'https://workflow.ainexsuite.com',
  },
];

export default function WorkspacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { selectedVariant } = useVisualStyle();
  const { colors: appColors } = useAllAppColors();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'activity' | 'settings' | 'ai-assistant' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

      <div className="relative z-10 flex min-h-screen flex-col text-ink-900">
        {/* Fixed Top Navigation */}
        <header
          className="fixed inset-x-0 top-0 z-30 backdrop-blur-2xl transition-colors border-b"
          style={{
            backgroundColor: 'rgba(5, 5, 5, 0.95)',
            borderColor: selectedVariant.id === 'ember-glow'
              ? 'rgba(249, 115, 22, 0.2)'
              : 'rgba(56, 189, 248, 0.2)',
            boxShadow: selectedVariant.id === 'ember-glow'
              ? '0 8px 30px -12px rgba(249, 115, 22, 0.3)'
              : '0 8px 30px -12px rgba(56, 189, 248, 0.3)'
          }}
        >
          <div className="mx-auto flex h-16 w-full max-w-7xl 2xl:max-w-[1440px] items-center px-4 sm:px-6">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 shadow-sm transition hover:bg-white/10"
                aria-label="Toggle navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden sm:block">
                <AinexStudiosLogo size="sm" align="center" asLink={true} />
              </div>
            </div>

            {/* Center: Search bar */}
            <div className="mx-4 flex flex-1 items-center gap-2 rounded-full bg-white/5 px-3 py-1 shadow-sm transition hover:bg-white/10 max-w-2xl h-9">
              <Search className="h-4 w-4 text-white/50 shrink-0" aria-hidden />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search or type a command..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white/70 shrink-0"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Right: Actions */}
            <div className="ml-auto flex items-center gap-2">
              {/* AI Assistant Button */}
              <button
                type="button"
                onClick={() => setActivePanel(activePanel === 'ai-assistant' ? null : 'ai-assistant')}
                className="flex h-9 w-9 items-center justify-center rounded-lg shadow-sm transition-all"
                style={{
                  backgroundColor: selectedVariant.id === 'ember-glow'
                    ? 'rgba(249, 115, 22, 0.15)'
                    : 'rgba(56, 189, 248, 0.15)',
                  color: selectedVariant.id === 'ember-glow'
                    ? '#fb923c'
                    : '#38bdf8'
                }}
                aria-label="AI Assistant"
              >
              </button>

              {/* Profile Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 h-9 rounded-full bg-white/5 text-white/70 shadow-sm transition hover:bg-white/10 px-2"
                  aria-label="Profile menu"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName ?? user.email ?? 'Account'}
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                      sizes="28px"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                      {user.displayName
                        ? user.displayName
                            .split(' ')
                            .map((part) => part.charAt(0))
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                        : (user.email?.charAt(0).toUpperCase() ?? 'U')}
                    </span>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                </button>
                <ProfileDropdown
                  isOpen={isProfileOpen}
                  onClose={() => setIsProfileOpen(false)}
                  onOpenSettings={() => {
                    setIsProfileOpen(false);
                    setActivePanel('settings');
                  }}
                  onOpenActivity={() => {
                    setIsProfileOpen(false);
                    setActivePanel('activity');
                  }}
                  onRefresh={() => {
                    setIsProfileOpen(false);
                    router.refresh();
                  }}
                  user={user}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden pt-16">
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

            {/* Activity Feed */}
            <div className="mt-16 pt-8 border-t border-white/5">
              <h3 className="text-lg font-semibold text-white mb-6 px-1">Recent Activity</h3>
              <ActivityFeed limit={10} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer appName="AINex Suite" />

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
    </div>
  );
}