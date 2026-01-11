'use client';

import { X } from 'lucide-react';
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
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Compact Luxury Design */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[180px] flex flex-col bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-r border-amber-900/30 transition-transform duration-200 ease-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-none flex items-center justify-between px-3 py-2.5 border-b border-amber-900/20">
          <h2 className="text-xs font-medium bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Apps
          </h2>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md transition hover:bg-amber-900/20"
            aria-label="Close sidebar"
          >
            <X className="h-3 w-3 text-amber-700" />
          </button>
        </div>

        {/* Scrollable List - Compact Luxury Menu */}
        <div className="flex-1 overflow-y-auto py-1">
          {/* Suite Dashboard */}
          <button
            type="button"
            onClick={() => handleAppNavigation('main')}
            className="w-full px-3 py-1.5 text-left text-xs text-amber-200/80 hover:text-amber-200 hover:bg-amber-900/10 transition-colors"
          >
            Dashboard
          </button>

          {/* Divider */}
          <div className="mx-3 my-1 border-t border-amber-900/20" />

          {/* Apps List */}
          {apps.map((app) => {
            const isCurrentApp = app.slug === currentAppSlug;

            return (
              <button
                key={app.slug}
                type="button"
                onClick={() => handleAppNavigation(app.slug)}
                disabled={isCurrentApp}
                className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                  isCurrentApp
                    ? 'text-amber-300 bg-amber-900/15 cursor-default'
                    : 'text-zinc-500 hover:text-amber-300 hover:bg-amber-900/10'
                }`}
              >
                {app.name}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
