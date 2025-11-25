'use client';

/**
 * AppSwitcher Component
 * Waffle menu that allows users to quickly switch between apps
 * Shows recently used apps and all available apps
 * Implements SSO - automatically signs users into target apps
 * Shows login status for each app
 */

import { useState, useEffect, useCallback } from 'react';
import { Grid, Home, Check, Circle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { AppConfig, AppSlug } from '@ainexsuite/types';
import { APP_REGISTRY } from '@ainexsuite/types';

// Type for login status of each app
type LoginStatus = 'checking' | 'logged-in' | 'logged-out' | 'error';

export interface AppSwitcherProps {
  currentApp: AppConfig;
  accessibleApps?: AppConfig[];
  recentApps?: AppSlug[];
  onAppClick?: (app: AppConfig) => void;
  className?: string;
  /** Whether current user is logged in on current app */
  isLoggedIn?: boolean;
}

export function AppSwitcher({
  currentApp,
  accessibleApps,
  recentApps = [],
  onAppClick,
  className = '',
  isLoggedIn = false,
}: AppSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loginStatuses, setLoginStatuses] = useState<Record<string, LoginStatus>>({});

  // Default to all apps if not provided
  const availableApps = accessibleApps || Object.values(APP_REGISTRY).filter(
    app => app.slug !== 'main' && app.status === 'active'
  );

  /**
   * Get the correct URL based on environment
   */
  const getBaseUrl = useCallback((app: AppConfig): string => {
    const isProd = process.env.NODE_ENV === 'production' ||
                   typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
    return isProd ? app.prodUrl : app.devUrl;
  }, []);

  /**
   * Check login status for all apps when switcher opens
   */
  const checkLoginStatuses = useCallback(async () => {
    // Set current app as logged in if we know the user is logged in
    if (isLoggedIn) {
      setLoginStatuses(prev => ({
        ...prev,
        [currentApp.slug]: 'logged-in'
      }));
    }

    // Get all apps to check (including main)
    const appsToCheck = [APP_REGISTRY.main, ...availableApps];

    // Initialize all as checking
    const initialStatuses: Record<string, LoginStatus> = {};
    appsToCheck.forEach(app => {
      // Current app status is already known
      if (app.slug === currentApp.slug) {
        initialStatuses[app.slug] = isLoggedIn ? 'logged-in' : 'logged-out';
      } else {
        initialStatuses[app.slug] = 'checking';
      }
    });
    setLoginStatuses(initialStatuses);

    // Check each app's session status in parallel
    const checkPromises = appsToCheck
      .filter(app => app.slug !== currentApp.slug) // Skip current app
      .map(async (app) => {
        try {
          const baseUrl = getBaseUrl(app);
          const response = await fetch(`${baseUrl}/api/auth/session`, {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
          });

          if (response.ok) {
            const data = await response.json();
            return { slug: app.slug, status: data.user ? 'logged-in' : 'logged-out' as LoginStatus };
          }
          return { slug: app.slug, status: 'logged-out' as LoginStatus };
        } catch {
          // CORS or network error - can't determine status
          return { slug: app.slug, status: 'error' as LoginStatus };
        }
      });

    const results = await Promise.all(checkPromises);

    setLoginStatuses(prev => {
      const updated = { ...prev };
      results.forEach(result => {
        updated[result.slug] = result.status;
      });
      return updated;
    });
  }, [availableApps, currentApp.slug, isLoggedIn, getBaseUrl]);

  // Check login statuses when the switcher opens
  useEffect(() => {
    if (isOpen) {
      checkLoginStatuses();
    }
  }, [isOpen, checkLoginStatuses]);

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

  /**
   * Get the correct URL based on environment
   * Always navigates to /workspace for authenticated users (except Suite Hub)
   */
  const getAppUrl = (app: AppConfig): string => {
    const baseUrl = getBaseUrl(app);
    // Suite Hub (main) goes to root, all other apps go to /workspace
    if (app.slug === 'main') {
      return baseUrl;
    }
    return `${baseUrl}/workspace`;
  };

  /**
   * Login status indicator component
   */
  const StatusIndicator = ({ slug }: { slug: string }) => {
    const status = loginStatuses[slug];

    if (status === 'checking') {
      return (
        <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-zinc-700 animate-pulse" />
      );
    }

    if (status === 'logged-in') {
      return (
        <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#0a0a0a] flex items-center justify-center">
          <Check className="h-2 w-2 text-white" strokeWidth={3} />
        </div>
      );
    }

    if (status === 'logged-out') {
      return (
        <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-zinc-600 ring-2 ring-[#0a0a0a]" />
      );
    }

    // Error or unknown - show nothing
    return null;
  };

  /**
   * Handle app switching with SSO
   * Requests a custom token and navigates with it
   */
  const handleAppSwitch = async (app: AppConfig, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default link navigation
    setIsOpen(false);

    const targetUrl = getAppUrl(app);
    console.log('🔄 SSO: Switching to', app.name, '- target:', targetUrl);

    try {
      // Call the custom-token API endpoint
      const response = await fetch('/api/auth/custom-token', {
        method: 'POST',
        credentials: 'include', // Include httpOnly cookies
      });

      if (response.ok) {
        const { customToken } = await response.json();
        console.log('✅ SSO: Custom token received, navigating with auth');

        // Get the correct URL based on environment
        const urlWithToken = new URL(targetUrl);
        urlWithToken.searchParams.set('auth_token', customToken);

        window.location.href = urlWithToken.toString();
      } else {
        // Token generation failed - user probably not logged in on this app
        // Navigate without SSO (target app will handle authentication)
        console.log('⚠️ SSO: No valid session, navigating without auth token');
        window.location.href = targetUrl;
      }
    } catch (error) {
      // If anything fails, fall back to regular navigation
      console.error('❌ SSO: Error during app switch:', error);
      window.location.href = targetUrl;
    }

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
            <a
              href={getAppUrl(APP_REGISTRY.main)}
              onClick={(e) => handleAppSwitch(APP_REGISTRY.main, e)}
              className="flex items-center gap-3 p-4 hover:bg-white/5 border-b border-white/10 transition-colors cursor-pointer"
            >
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-sky-500">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <StatusIndicator slug="main" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white text-sm">
                  {APP_REGISTRY.main.name}
                </div>
                <div className="text-xs text-white/60">
                  Return to dashboard
                </div>
              </div>
            </a>

            {/* Recently Used Section */}
            {recentlyUsedApps.length > 0 && (
              <div className="p-2 border-b border-white/10">
                <div className="text-xs font-semibold text-white/40 px-2 py-2 uppercase tracking-wide">
                  Recently Used
                </div>
                {recentlyUsedApps.map(app => {
                  const Icon = getIcon(app.icon);
                  return (
                    <a
                      key={app.slug}
                      href={getAppUrl(app)}
                      onClick={(e) => handleAppSwitch(app, e)}
                      className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
                        app.slug === currentApp.slug ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="relative">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${app.gradient}`}
                        >
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <StatusIndicator slug={app.slug} />
                      </div>
                      <span className="text-sm text-white font-medium">
                        {app.name}
                      </span>
                    </a>
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
                    <a
                      key={app.slug}
                      href={getAppUrl(app)}
                      onClick={(e) => handleAppSwitch(app, e)}
                      className={`flex flex-col items-center p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
                        isActive ? 'bg-white/10 ring-1 ring-white/20' : ''
                      }`}
                    >
                      <div className="relative mb-2">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${app.gradient}`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <StatusIndicator slug={app.slug} />
                      </div>
                      <span className="text-xs font-medium text-white text-center">
                        {app.name}
                      </span>
                      {isActive && (
                        <div className="mt-1 h-1 w-1 rounded-full bg-white/60" />
                      )}
                    </a>
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
