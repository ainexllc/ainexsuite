'use client';

import { X, Home } from 'lucide-react';
import { navigateToApp, getCurrentAppSlug } from '../../utils/cross-app-navigation';
import { NotesStickyIcon, AdminControlsIcon, CalendarWeekIcon, ProjectsTimelineIcon, FitCaloriesIcon, HealthActivityIcon, TodoTargetIcon, GrowHabitIcon, MomentsCameraIcon, JourneyJournalIcon, WorkflowProcessIcon, PulseAmbientIcon } from '../ai';

// Map hex colors (from app config) to their light variants
const HEX_COLOR_MAP: Record<string, string> = {
  '#eab308': '#fbbf24', // yellow
  '#f97316': '#fb923c', // orange
  '#ef4444': '#f87171', // red
  '#ec4899': '#f472b6', // pink
  '#f43f5e': '#fb7185', // rose
  '#a855f7': '#c084fc', // purple
  '#8b5cf6': '#a78bfa', // violet
  '#6366f1': '#818cf8', // indigo
  '#3b82f6': '#60a5fa', // blue
  '#0ea5e9': '#38bdf8', // sky
  '#06b6d4': '#22d3ee', // cyan
  '#14b8a6': '#2dd4bf', // teal
  '#10b981': '#34d399', // emerald
  '#22c55e': '#4ade80', // green
  '#71717a': '#a1a1aa', // zinc
  '#64748b': '#94a3b8', // slate
};

// Default color (blue)
const DEFAULT_COLOR = '#3b82f6';
const DEFAULT_LIGHT = '#60a5fa';

// Get color pair from hex color
const getColorPair = (hexColor: string | undefined): { base: string; light: string } => {
  const base = hexColor || DEFAULT_COLOR;
  const light = HEX_COLOR_MAP[base] || DEFAULT_LIGHT;
  return { base, light };
};

// Map app slugs to their animated icons
const ANIMATED_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string; isAnimating?: boolean }>> = {
  notes: NotesStickyIcon,
  admin: AdminControlsIcon,
  calendar: CalendarWeekIcon,
  projects: ProjectsTimelineIcon,
  fit: FitCaloriesIcon,
  health: HealthActivityIcon,
  todo: TodoTargetIcon,
  habits: GrowHabitIcon,
  album: MomentsCameraIcon,
  journal: JourneyJournalIcon,
  flow: WorkflowProcessIcon,
  mosaic: PulseAmbientIcon,
  tables: ProjectsTimelineIcon,
};

// App subtitles
const APP_SUBTITLES: Record<string, string> = {
  notes: 'Quick capture',
  admin: 'Platform settings',
  calendar: 'Manage your agenda',
  projects: 'Track progress',
  fit: 'Workout tracking',
  health: 'Track wellness',
  todo: 'Hit your goals',
  habits: 'Build streaks',
  album: 'Curate memories',
  journal: 'Daily reflections',
  flow: 'Visual workflows',
  mosaic: 'All apps at a glance',
  subs: 'Track subscriptions',
  docs: 'Rich documents',
  tables: 'Data tables',
};

export interface AppNavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  apps: Array<{
    name: string;
    slug: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }>;
  user?: {
    uid?: string;
    subscriptionStatus?: string;
    subscriptionTier?: string;
    trialStartDate?: number;
  };
}

export function AppNavigationSidebar({
  isOpen,
  onClose,
  apps,
}: AppNavigationSidebarProps) {
  const currentAppSlug = getCurrentAppSlug();

  const handleAppNavigation = (slug: string) => {
    onClose();
    navigateToApp(slug, currentAppSlug || undefined);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[200px] flex flex-col bg-background/60 backdrop-blur-xl border-r border-border transition-transform duration-300 ease-out z-40 overflow-hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-purple-500/20 blur-3xl rounded-full pointer-events-none opacity-50" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none opacity-50" />

        {/* Header */}
        <div className="relative z-10 flex-none flex items-center justify-between p-4 border-b border-border bg-transparent">
          <h2 className="text-lg font-semibold text-foreground">Apps</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 transition hover:bg-foreground/10"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="relative z-10 flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {/* Suite Dashboard - Navigate to main app (ainexspace.com) */}
            <button
              type="button"
              onClick={() => handleAppNavigation('main')}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground w-full text-left"
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Suite Dashboard</span>
            </button>

            {/* Divider */}
            <div className="my-2 border-t border-border" />

            {/* Apps List */}
            <div className="grid gap-2">
              {apps.map((app) => {
                const IconComponent = app.icon;
                const isCurrentApp = app.slug === currentAppSlug;
                const AnimatedIcon = ANIMATED_ICONS[app.slug];
                const subtitle = APP_SUBTITLES[app.slug];
                const colors = getColorPair(app.color);
                const iconColor = isCurrentApp ? colors.light : colors.base;

                // Enhanced app link with animated icon (if available)
                if (AnimatedIcon) {
                  return (
                    <button
                      key={app.slug}
                      type="button"
                      onClick={() => handleAppNavigation(app.slug)}
                      disabled={isCurrentApp}
                      className="group relative rounded-xl p-2 transition-all duration-300 hover:translate-x-1 overflow-hidden disabled:cursor-default disabled:opacity-75 w-full text-left"
                      style={{
                        '--app-color': colors.base,
                        '--app-color-light': colors.light,
                      } as React.CSSProperties}
                    >
                      {/* Animated gradient background using inline styles */}
                      <div
                        className="absolute inset-0 rounded-xl transition-all duration-500"
                        style={{
                          background: isCurrentApp
                            ? `linear-gradient(to bottom right, ${colors.base}4d, ${colors.light}33)`
                            : `linear-gradient(to bottom right, ${colors.base}1a, ${colors.light}0d)`,
                        }}
                      />
                      <div
                        className="absolute inset-0 rounded-xl transition-all duration-300 group-hover:opacity-100"
                        style={{
                          background: !isCurrentApp ? `linear-gradient(to bottom right, ${colors.base}40, ${colors.light}26)` : 'transparent',
                          opacity: 0,
                        }}
                      />
                      <div
                        className="absolute inset-0 rounded-xl border transition-all duration-300"
                        style={{
                          borderColor: isCurrentApp ? `${colors.light}80` : `${colors.base}33`,
                        }}
                      />

                      {/* Content wrapper */}
                      <div className="relative z-10 flex items-center gap-3">
                        {/* Large animated icon container */}
                        <div
                          className="relative flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300"
                          style={{
                            backgroundColor: isCurrentApp ? `${colors.light}33` : `${colors.base}1a`,
                          }}
                        >
                          <AnimatedIcon
                            size={32}
                            color={iconColor}
                            isAnimating={true}
                          />
                        </div>

                        {/* Text content */}
                        <div className="flex flex-col min-w-0">
                          <span
                            className="text-sm font-semibold transition-colors duration-300"
                            style={{
                              color: isCurrentApp ? colors.light : 'var(--foreground)',
                            }}
                          >
                            {app.name}
                          </span>
                          {subtitle && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              {subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                }

                // Standard app links (fallback for apps without animated icons)
                return (
                  <button
                    key={app.slug}
                    type="button"
                    onClick={() => handleAppNavigation(app.slug)}
                    disabled={isCurrentApp}
                    className="group relative flex items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:translate-x-1 overflow-hidden disabled:cursor-default disabled:opacity-75 w-full text-left"
                    style={{
                      '--accent': colors.base,
                      '--accent-dim': `${colors.base}1a`,
                      '--accent-glow': `${colors.base}40`,
                    } as React.CSSProperties}
                  >
                    {/* Background & Border Effects */}
                    <div className={`absolute inset-0 bg-foreground/5 border border-foreground/5 rounded-xl transition-all duration-300 ${isCurrentApp ? 'bg-[var(--accent-dim)] border-[var(--accent-glow)]' : 'group-hover:bg-[var(--accent-dim)] group-hover:border-[var(--accent-glow)] group-hover:shadow-[0_0_15px_-3px_var(--accent-dim)]'}`} />

                    {/* Icon Container */}
                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300 flex-shrink-0 overflow-hidden ${isCurrentApp ? 'bg-[var(--accent)] border-[var(--accent)] text-background' : 'bg-background/40 border-border group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-background'}`}
                      style={{ color: isCurrentApp ? undefined : colors.base }}
                    >
                      <IconComponent className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    {/* Text */}
                    <span className={`relative z-10 text-sm font-medium transition-colors duration-300 truncate ${isCurrentApp ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {app.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
