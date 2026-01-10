'use client';

import { X, Home } from 'lucide-react';
import { navigateToApp, getCurrentAppSlug } from '../../utils/cross-app-navigation';

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

      {/* Sidebar - Compact responsive design */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[180px] sm:w-[200px] flex flex-col bg-background/95 backdrop-blur-xl border-r border-border transition-transform duration-200 ease-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-none flex items-center justify-between px-3 py-2.5 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Apps</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground/5 transition hover:bg-foreground/10"
            aria-label="Close sidebar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Scrollable List - Compact text-based menu */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-0.5">
            {/* Suite Dashboard */}
            <button
              type="button"
              onClick={() => handleAppNavigation('main')}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground w-full text-left"
            >
              <Home className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Dashboard</span>
            </button>

            {/* Divider */}
            <div className="my-1.5 border-t border-border" />

            {/* Apps List - Compact */}
            <div className="space-y-0.5">
              {apps.map((app) => {
                const isCurrentApp = app.slug === currentAppSlug;

                return (
                  <button
                    key={app.slug}
                    type="button"
                    onClick={() => handleAppNavigation(app.slug)}
                    disabled={isCurrentApp}
                    className={`flex items-center rounded-md px-2 py-1.5 text-sm font-medium transition w-full text-left ${
                      isCurrentApp
                        ? 'bg-foreground/10 text-foreground cursor-default'
                        : 'text-muted-foreground hover:bg-foreground/10 hover:text-foreground'
                    }`}
                  >
                    <span className="truncate">{app.name}</span>
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
