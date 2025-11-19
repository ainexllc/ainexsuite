'use client';

import { useState } from 'react';
import { Menu, Sparkles, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { AinexStudiosLogo } from '../branding/ainex-studios-logo';

interface WorkspaceHeaderProps {
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  };
  searchPlaceholder?: string;
  onSignOut: () => void;
  appName?: string;
}

/**
 * WorkspaceHeader Component
 *
 * Standardized header for workspace pages with:
 * - Fixed positioning with backdrop blur
 * - Theme-aware border and shadow
 * - Search bar
 * - AI assistant button
 * - Profile dropdown with sign out
 *
 * Extracted from Workflow app for reusability across all apps.
 *
 * @example
 * ```tsx
 * <WorkspaceHeader
 *   user={user}
 *   searchPlaceholder="Search workflows..."
 *   onSignOut={handleSignOut}
 * />
 * ```
 */
export function WorkspaceHeader({
  user,
  searchPlaceholder = "Search...",
  onSignOut,
  appName,
}: WorkspaceHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header
      className="fixed inset-x-0 top-0 z-30 backdrop-blur-2xl transition-colors border-b"
      style={{
        backgroundColor: 'rgba(5, 5, 5, 0.95)',
        borderColor: 'rgba(var(--theme-primary-rgb), 0.2)',
        boxShadow: '0 8px 30px -12px rgba(var(--theme-primary-rgb), 0.3)'
      }}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl 2xl:max-w-[1440px] items-center px-4 sm:px-6">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 shadow-sm transition hover:bg-white/10"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:block">
            <AinexStudiosLogo size="sm" align="center" asLink={true} appName={appName} />
          </div>
        </div>

        {/* Center: Spacer */}
        <div className="flex-1" />

        {/* Right: Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* AI Assistant Button */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg shadow-sm transition-all"
            style={{
              backgroundColor: 'rgba(var(--theme-primary-rgb), 0.15)',
              color: 'var(--theme-primary-light)'
            }}
            aria-label="AI Assistant"
          >
            <Sparkles className="h-4 w-4" />
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
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-xs font-semibold text-white">
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

            {/* Simple Profile Dropdown */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/10 bg-[#0a0a0a] shadow-xl z-20">
                  <div className="p-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">{user.displayName || 'User'}</p>
                    <p className="text-xs text-white/50">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        // Settings functionality here
                      }}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onSignOut();
                      }}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-red-400 transition hover:bg-white/10"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
