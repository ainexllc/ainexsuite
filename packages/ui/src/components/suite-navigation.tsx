'use client';

/**
 * SuiteNavigation Component
 * Unified navigation bar for all AINexSuite apps
 * Provides consistent layout, app switcher, search, and profile access
 */

import { useState } from 'react';
import { Search, X, Sparkles, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import type { AppConfig } from '@ainexsuite/types';

export interface SuiteNavigationProps {
  currentApp: AppConfig;
  showAppSwitcher?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  onSearchFocus?: () => void;
  customActions?: React.ReactNode;
  user?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  };
  onProfileClick?: () => void;
  onAIAssistantClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function SuiteNavigation({
  currentApp,
  showAppSwitcher = true,
  showSearch = true,
  searchPlaceholder = 'Search...',
  onSearchChange,
  onSearchFocus,
  customActions,
  user,
  onProfileClick,
  onAIAssistantClick,
  className = '',
  style = {},
}: SuiteNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearchChange?.('');
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 backdrop-blur-2xl transition-colors border-b ${className}`}
      style={{
        backgroundColor: 'rgba(5, 5, 5, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...style,
      }}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl 2xl:max-w-[1440px] items-center px-4 sm:px-6">
        {/* Left: App Switcher Placeholder + App Info */}
        <div className="flex items-center gap-3">
          {showAppSwitcher && (
            <div
              id="app-switcher-mount"
              className="flex items-center justify-center h-10 w-10"
            >
              {/* AppSwitcher will be mounted here */}
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-lg font-semibold text-white">
              {currentApp.name}
            </span>
          </div>
        </div>

        {/* Center: Search bar */}
        {showSearch && (
          <div className="mx-4 flex flex-1 items-center gap-2 rounded-full bg-white/5 px-3 py-1 shadow-sm transition hover:bg-white/10 max-w-2xl h-9">
            <Search className="h-4 w-4 text-white/50 shrink-0" aria-hidden />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={onSearchFocus}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white/70 shrink-0"
                aria-label="Clear search"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Right: Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Custom Actions */}
          {customActions}

          {/* AI Assistant Button */}
          {onAIAssistantClick && (
            <button
              type="button"
              onClick={onAIAssistantClick}
              className="flex h-9 w-9 items-center justify-center rounded-lg shadow-sm transition-all bg-white/10 hover:bg-white/20 text-white"
              aria-label="AI Assistant"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          )}

          {/* Profile Dropdown Trigger */}
          {user && onProfileClick && (
            <button
              type="button"
              className="flex items-center gap-2 h-9 rounded-full bg-white/5 text-white/70 shadow-sm transition hover:bg-white/10 px-2"
              aria-label="Profile menu"
              onClick={onProfileClick}
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
          )}
        </div>
      </div>
    </header>
  );
}
