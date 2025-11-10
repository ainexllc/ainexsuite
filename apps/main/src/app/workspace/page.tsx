'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { AppCard } from '@/components/app-card';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { NavigationPanel } from '@/components/navigation-panel';
import { ActivityPanel } from '@/components/activity-panel';
import UniversalSearch from '@/components/universal-search';
import ActivityFeed from '@/components/activity-feed';
import { LogoWordmark } from '@/components/branding/logo-wordmark';
import { useVisualStyle } from '@/lib/theme/visual-style';
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
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { getAppsUsedCount } from '@ainexsuite/auth';
import { Footer } from '@/components/footer';

// Environment-aware app URLs
const isDev = process.env.NODE_ENV === 'development';

const apps = [
  {
    name: 'Notes',
    slug: 'notes',
    description: 'Quickly capture your thoughts, ideas, and notes. Organize with labels and AI-powered search to find anything instantly.',
    icon: FileText,
    color: 'from-yellow-500 to-orange-500',
    url: isDev ? 'http://localhost:3001' : 'https://notes.ainexsuite.com',
  },
  {
    name: 'Journey',
    slug: 'journey',
    description: 'Reflect on your daily experiences with guided prompts. Track your mood and emotional growth over time.',
    icon: BookOpen,
    color: 'from-purple-500 to-pink-500',
    url: isDev ? 'http://localhost:3002' : 'https://journey.ainexsuite.com',
  },
  {
    name: 'Tasks',
    slug: 'tasks',
    description: 'Manage your to-dos and projects with powerful organization tools. Set priorities, due dates, and never miss a deadline.',
    icon: CheckSquare,
    color: 'from-blue-500 to-cyan-500',
    url: isDev ? 'http://localhost:3003' : 'https://tasks.ainexsuite.com',
  },
  {
    name: 'Track',
    slug: 'track',
    description: 'Build and maintain great habits with visual streaks and progress tracking. Watch your consistency improve over time.',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    url: isDev ? 'http://localhost:3004' : 'https://track.ainexsuite.com',
  },
  {
    name: 'Moments',
    slug: 'moments',
    description: 'Capture life\'s beautiful moments with photos and captions. Create a visual timeline of your most precious memories.',
    icon: Camera,
    color: 'from-pink-500 to-rose-500',
    url: isDev ? 'http://localhost:3005' : 'https://moments.ainexsuite.com',
  },
  {
    name: 'Grow',
    slug: 'grow',
    description: 'Track your learning journey and skill development. Set learning goals and celebrate milestones as you expand your knowledge.',
    icon: GraduationCap,
    color: 'from-indigo-500 to-purple-500',
    url: isDev ? 'http://localhost:3006' : 'https://grow.ainexsuite.com',
  },
  {
    name: 'Pulse',
    slug: 'pulse',
    description: 'Monitor your health metrics and wellness trends. Track symptoms, medications, and vital signs in one place.',
    icon: ActivityIcon,
    color: 'from-red-500 to-orange-500',
    url: isDev ? 'http://localhost:3007' : 'https://pulse.ainexsuite.com',
  },
  {
    name: 'Fit',
    slug: 'fit',
    description: 'Record workouts, track fitness progress, and achieve your health goals. Visualize your strength and endurance improvements.',
    icon: Dumbbell,
    color: 'from-orange-500 to-amber-500',
    url: isDev ? 'http://localhost:3008' : 'https://fit.ainexsuite.com',
  },
];

export default function WorkspacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { selectedVariant } = useVisualStyle();
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

  // Filter apps based on what user has accessed
  const appsUsedCount = user ? getAppsUsedCount(user) : 0;
  const displayedApps = appsUsedCount === 0
    ? apps // Show all apps if none accessed
    : apps.filter(app => user?.appsUsed?.[app.slug as keyof typeof user.appsUsed]); // Show only accessed apps

  // Get list of accessed apps
  const accessedApps = apps.filter(app => user?.appsUsed?.[app.slug as keyof typeof user.appsUsed]);

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
          <div className="mx-auto flex h-16 w-full max-w-7xl 2xl:max-w-[1440px] items-center px-4 sm:px-6 cq-nav">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="icon-button h-10 w-10 bg-surface-muted/80 shadow-sm hover:bg-surface-muted"
                aria-label="Toggle navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden sm:block">
                <LogoWordmark href="/workspace" iconSize={48} variant="dark" />
              </div>
            </div>

            {/* Center: Search bar */}
            <div className="top-nav-search mx-4 flex flex-1 items-center gap-2 rounded-full bg-surface-muted/80 px-3 py-1 shadow-sm transition hover:bg-surface-muted max-w-2xl h-9">
              <Search className="top-nav-search-icon h-4 w-4 text-ink-500 shrink-0" aria-hidden />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search conversations..."
                className="top-nav-search-input w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="icon-button h-6 w-6 rounded-full text-ink-500 hover:bg-surface-muted hover:text-ink-700 shrink-0"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                className="top-nav-search-button icon-button h-8 w-8 rounded-full bg-surface-muted/70 text-ink-600 hover:bg-surface-muted shrink-0"
                aria-label="Open search"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Right: Actions */}
            <div className="ml-auto flex items-center gap-2 top-nav-actions">
              {/* AI Assistant Button */}
              <button
                type="button"
                onClick={() => setActivePanel(activePanel === 'ai-assistant' ? null : 'ai-assistant')}
                className="icon-button h-9 w-9 shadow-sm transition-all"
                style={{
                  backgroundColor: selectedVariant.id === 'ember-glow'
                    ? 'rgba(249, 115, 22, 0.15)'
                    : 'rgba(56, 189, 248, 0.15)',
                  color: selectedVariant.id === 'ember-glow'
                    ? '#f97316'
                    : '#7dd3fc'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = selectedVariant.id === 'ember-glow'
                    ? 'rgba(249, 115, 22, 0.25)'
                    : 'rgba(56, 189, 248, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = selectedVariant.id === 'ember-glow'
                    ? 'rgba(249, 115, 22, 0.15)'
                    : 'rgba(56, 189, 248, 0.15)';
                }}
                aria-label="AI Assistant"
              >
                <Sparkles className="h-4 w-4" />
              </button>

              {/* Profile Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 h-9 rounded-full bg-surface-muted/80 text-ink-700 shadow-sm transition hover:bg-surface-muted px-2"
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
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-xs font-semibold text-white">
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
                  <ChevronDown className="h-3.5 w-3.5 text-ink-500" />
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
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Welcome Section */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user.displayName || 'there'}! 👋
              </h2>
              <p className="text-lg text-white/70">
                {appsUsedCount === 0
                  ? 'Explore our apps to get started with your productivity journey'
                  : appsUsedCount === 1
                  ? 'Try another app to unlock the full Suite with a 30-day trial'
                  : 'Choose an app to continue your productivity journey'}
              </p>
            </div>

            {/* Apps Summary */}
            <div
              className="mb-8 p-6 rounded-xl border backdrop-blur"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor: selectedVariant.id === 'ember-glow'
                  ? 'rgba(249, 115, 22, 0.2)'
                  : 'rgba(56, 189, 248, 0.2)',
                boxShadow: selectedVariant.id === 'ember-glow'
                  ? '0 12px 40px -20px rgba(249, 115, 22, 0.5)'
                  : '0 12px 40px -20px rgba(56, 189, 248, 0.5)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {appsUsedCount === 0
                      ? 'Your Apps (0)'
                      : `Your Apps (${appsUsedCount})`}
                  </h3>
                  {appsUsedCount === 0 ? (
                    <p className="text-sm text-white/60">
                      Start exploring our apps below to begin tracking your progress
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {accessedApps.map((app) => (
                        <div
                          key={app.slug}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.08)'
                          }}
                        >
                          <app.icon
                            className="h-4 w-4"
                            style={{
                              color: selectedVariant.id === 'ember-glow'
                                ? '#f97316'
                                : '#7dd3fc'
                            }}
                          />
                          <span className="text-sm text-white/80">{app.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {appsUsedCount === 1 && (
                  <div className="text-right">
                    <p className="text-sm text-white/60 mb-1">Try another app to unlock:</p>
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: selectedVariant.id === 'ember-glow'
                          ? '#f97316'
                          : '#7dd3fc'
                      }}
                    >
                      Full Suite Access
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Apps Grid */}
            {displayedApps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedApps.map((app) => (
                  <AppCard key={app.slug} app={app} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/70 mb-4">No apps accessed yet</p>
                <p className="text-sm text-white/50">Click on any app to get started!</p>
              </div>
            )}

            {/* Activity Feed */}
            <div className="mt-16">
              <ActivityFeed limit={30} />
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

