'use client';

/**
 * AppSwitcher Component
 * Waffle menu that allows users to quickly switch between apps
 * Shows recently used apps and all available apps
 */

import { useState, useEffect } from 'react';
import { Grid, ChevronDown, Home } from 'lucide-react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import type { AppConfig, AppSlug } from '@ainexsuite/types';
import { APP_REGISTRY } from '@ainexsuite/types';

export interface AppSwitcherProps {
  currentApp: AppConfig;
  accessibleApps?: AppConfig[];
  recentApps?: AppSlug[];
  onAppClick?: (app: AppConfig) => void;
  className?: string;
}

export function AppSwitcher({
  currentApp,
  accessibleApps,
  recentApps = [],
  onAppClick,
  className = '',
}: AppSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Default to all apps if not provided
  const availableApps = accessibleApps || Object.values(APP_REGISTRY).filter(
    app => app.slug !== 'main' && app.status === 'active'
  );

  // Get recently used apps
  const recentlyUsedApps = recentApps
    .map(slug => APP_REGISTRY[slug])
    .filter(Boolean)
    .slice(0, 3);

  // Get icon component from lucide-react
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Circle;
  };

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleAppClick = (app: AppConfig) => {
    setIsOpen(false);
    onAppClick?.(app);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        aria-label="App switcher"
        aria-expanded={isOpen}
      >
        <Grid className="h-5 w-5 text-white" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div className="absolute left-0 top-full mt-2 w-80 bg-[#0a0a0a] rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden">
            {/* Suite Hub Link */}
            <Link
              href={APP_REGISTRY.main.devUrl}
              onClick={() => handleAppClick(APP_REGISTRY.main)}
              className="flex items-center gap-3 p-4 hover:bg-white/5 border-b border-white/10 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-sky-500">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white text-sm">
                  {APP_REGISTRY.main.name}
                </div>
                <div className="text-xs text-white/60">
                  Return to dashboard
                </div>
              </div>
            </Link>

            {/* Recently Used Section */}
            {recentlyUsedApps.length > 0 && (
              <div className="p-2 border-b border-white/10">
                <div className="text-xs font-semibold text-white/40 px-2 py-2 uppercase tracking-wide">
                  Recently Used
                </div>
                {recentlyUsedApps.map(app => {
                  const Icon = getIcon(app.icon);
                  return (
                    <Link
                      key={app.slug}
                      href={app.devUrl}
                      onClick={() => handleAppClick(app)}
                      className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors ${
                        app.slug === currentApp.slug ? 'bg-white/10' : ''
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${app.gradient}`}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm text-white font-medium">
                        {app.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* All Apps Grid */}
            <div className="p-3">
              <div className="text-xs font-semibold text-white/40 px-2 py-2 uppercase tracking-wide">
                All Apps
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableApps.map(app => {
                  const Icon = getIcon(app.icon);
                  const isActive = app.slug === currentApp.slug;

                  return (
                    <Link
                      key={app.slug}
                      href={app.devUrl}
                      onClick={() => handleAppClick(app)}
                      className={`flex flex-col items-center p-3 rounded-lg hover:bg-white/5 transition-colors ${
                        isActive ? 'bg-white/10 ring-1 ring-white/20' : ''
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${app.gradient} mb-2`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-white text-center">
                        {app.name}
                      </span>
                      {isActive && (
                        <div className="mt-1 h-1 w-1 rounded-full bg-white/60" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
