'use client';

import { X, Home, RefreshCw, Check } from 'lucide-react';
import { useEffect } from 'react';
import { navigateToApp, getCurrentAppSlug } from '../../utils/cross-app-navigation';
import { useAppLoginStatus } from '../../hooks/use-app-login-status';
import type { LoginStatus } from '../../utils/cross-app-navigation';

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

/**
 * Small status indicator component
 */
function LoginStatusIndicator({ status }: { status: LoginStatus }) {
  if (status === 'checking') {
    return (
      <div
        className="h-2.5 w-2.5 rounded-full bg-zinc-600 animate-pulse"
        title="Checking login status..."
      />
    );
  }

  if (status === 'logged-in') {
    return (
      <div
        className="h-2.5 w-2.5 rounded-full bg-emerald-500 flex items-center justify-center"
        title="Logged in"
      >
        <Check className="h-1.5 w-1.5 text-white" strokeWidth={3} />
      </div>
    );
  }

  if (status === 'logged-out') {
    return (
      <div
        className="h-2.5 w-2.5 rounded-full bg-zinc-600"
        title="Not logged in"
      />
    );
  }

  return null;
}

export function AppNavigationSidebar({
  isOpen,
  onClose,
  apps,
  user,
}: AppNavigationSidebarProps) {
  const currentAppSlug = getCurrentAppSlug();
  const isLoggedIn = !!user?.uid;
  const { statuses, isChecking, checkStatuses, getStatus } = useAppLoginStatus({ isLoggedIn });

  // Check login statuses when sidebar opens and user is logged in
  useEffect(() => {
    if (isOpen && isLoggedIn) {
      checkStatuses();
    }
  }, [isOpen, isLoggedIn, checkStatuses]);

  const handleAppNavigation = (slug: string) => {
    onClose();
    navigateToApp(slug, currentAppSlug || undefined);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[200px] flex flex-col bg-black/60 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ease-out z-40 overflow-hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-purple-500/20 blur-3xl rounded-full pointer-events-none opacity-50" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none opacity-50" />

        {/* Header */}
        <div className="relative z-10 flex-none flex items-center justify-between p-4 border-b border-white/10 bg-transparent">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Apps</h2>
            {isLoggedIn && (
              <button
                onClick={checkStatuses}
                disabled={isChecking}
                className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Refresh SSO status"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-white/50 ${isChecking ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="relative z-10 flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {/* Suite Dashboard - Navigate to main app (ainexsuite.com) */}
            <button
              type="button"
              onClick={() => handleAppNavigation('main')}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white w-full text-left"
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Suite Dashboard</span>
              {isLoggedIn && (
                <span className="ml-auto flex-shrink-0">
                  <LoginStatusIndicator status={getStatus('main')} />
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="my-2 border-t border-white/10" />

            {/* Apps List */}
            <div className="grid gap-2">
              {apps.map((app) => {
                const IconComponent = app.icon;
                const isCurrentApp = app.slug === currentAppSlug;
                return (
                  <button
                    key={app.slug}
                    type="button"
                    onClick={() => handleAppNavigation(app.slug)}
                    disabled={isCurrentApp}
                    className="group relative flex items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:translate-x-1 overflow-hidden disabled:cursor-default disabled:opacity-75 w-full text-left"
                    style={{
                      '--accent': app.color,
                      '--accent-dim': `${app.color}1a`, // 10% opacity
                      '--accent-glow': `${app.color}40`, // 25% opacity
                    } as React.CSSProperties}
                  >
                    {/* Background & Border Effects */}
                    <div className={`absolute inset-0 bg-white/5 border border-white/5 rounded-xl transition-all duration-300 ${isCurrentApp ? 'bg-[var(--accent-dim)] border-[var(--accent-glow)]' : 'group-hover:bg-[var(--accent-dim)] group-hover:border-[var(--accent-glow)] group-hover:shadow-[0_0_15px_-3px_var(--accent-dim)]'}`} />

                    {/* Icon Container */}
                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300 flex-shrink-0 ${isCurrentApp ? 'bg-[var(--accent)] border-[var(--accent)] text-black' : 'bg-black/40 border-white/10 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-black'}`}
                      style={{ color: isCurrentApp ? undefined : app.color }}
                    >
                      <IconComponent className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    {/* Text */}
                    <span className={`relative z-10 text-sm font-medium transition-colors duration-300 truncate ${isCurrentApp ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                      {app.name}
                    </span>

                    {/* Login Status Indicator */}
                    {isLoggedIn && (
                      <span className="relative z-10 ml-auto flex-shrink-0">
                        <LoginStatusIndicator status={getStatus(app.slug)} />
                      </span>
                    )}

                    {/* Arrow (only when not logged in) */}
                    {!isCurrentApp && !isLoggedIn && (
                      <span className="relative z-10 ml-auto text-xs text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--accent)] flex-shrink-0">
                        →
                      </span>
                    )}
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
