'use client';

import { Menu, ChevronDown, Maximize, Minimize, Search } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { CommandPalette } from '../command-palette';
import { MagicSparkMic } from '../ai';
import Image from 'next/image';
import { AinexStudiosLogo } from '../branding/ainex-studios-logo';
import { HeaderBreadcrumbs } from '../navigation/header-breadcrumbs';
import { NotificationBell } from '../navigation/notification-bell';
import { AnimatedAvatarPlayer } from '../animated-avatar-player';
import { AnimatedThemeToggler } from '../theme/animated-theme-toggler';
import type { BreadcrumbItem, QuickAction } from '@ainexsuite/types';

interface WorkspaceHeaderProps {
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    /** Square-cropped icon URL for circular avatars */
    iconURL?: string | null;
    subscriptionStatus?: string;
    subscriptionTier?: string;
    trialStartDate?: number;
    // Animated avatar fields
    animatedAvatarURL?: string | null;
    useAnimatedAvatar?: boolean;
  };
  onSignOut: () => void;
  appName?: string;
  appColor?: string;
  onNavigationToggle?: () => void;
  onProfileToggle?: () => void;
  // NEW: Breadcrumbs
  /**
   * Breadcrumb items for navigation
   */
  breadcrumbs?: BreadcrumbItem[];
  // NEW: Notifications
  /**
   * Number of unread notifications
   */
  notificationCount?: number;
  /**
   * Callback when notification bell is clicked
   */
  onNotificationsClick?: () => void;
  /**
   * Whether the notifications panel is open
   */
  isNotificationsOpen?: boolean;
  // NEW: Quick Actions
  /**
   * Quick actions for the app
   */
  quickActions?: QuickAction[];
  /**
   * Callback when a quick action is selected
   */
  onQuickAction?: (actionId: string) => void;
  /**
   * Whether the quick actions menu is open
   */
  isQuickActionsOpen?: boolean;
  /**
   * Callback to toggle quick actions menu
   */
  onQuickActionsToggle?: () => void;
  // NEW: AI Assistant
  /**
   * Callback when AI button is clicked
   */
  onAiAssistantClick?: () => void;
}

/**
 * WorkspaceHeader Component
 *
 * Standardized header for workspace pages with:
 * - Fixed positioning with backdrop blur
 * - Theme-aware border and shadow
 * - Breadcrumbs navigation
 * - Quick actions menu
 * - Notification bell
 * - AI assistant button
 * - Profile toggle (triggers sidebar)
 *
 * @example
 * ```tsx
 * <WorkspaceHeader
 *   user={user}
 *   onSignOut={handleSignOut}
 *   onProfileToggle={() => setShowProfile(true)}
 *   breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Notes', current: true }]}
 *   notificationCount={3}
 *   onNotificationsClick={() => setNotificationsOpen(true)}
 *   quickActions={noteQuickActions}
 *   onQuickAction={handleQuickAction}
 * />
 * ```
 */
export function WorkspaceHeader({
  user,
  onSignOut: _onSignOut,
  appName,
  appColor,
  onNavigationToggle,
  onProfileToggle,
  breadcrumbs,
  notificationCount = 0,
  onNotificationsClick,
  isNotificationsOpen = false,
  quickActions: _quickActions = [],
  onQuickAction: _onQuickAction,
  isQuickActionsOpen: _isQuickActionsOpen = false,
  onQuickActionsToggle: _onQuickActionsToggle,
  onAiAssistantClick,
}: WorkspaceHeaderProps) {
  // Command palette state
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  const checkFullscreen = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', checkFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
    };
  }, [checkFullscreen]);

  // Command palette keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  // Render user avatar/initials (shared between header and floating controls)
  // Supports animated avatars when user.useAnimatedAvatar is true
  // Prefers iconURL (square-cropped) for circular display, falls back to photoURL
  const renderUserAvatar = () => {
    // Show animated avatar if enabled and available
    if (user.useAnimatedAvatar && user.animatedAvatarURL) {
      return (
        <AnimatedAvatarPlayer
          src={user.animatedAvatarURL}
          className="h-7 w-7 rounded-full object-cover"
          alt={user.displayName ?? 'Avatar'}
          maxPlays={4}
          pauseDuration={10000}
        />
      );
    }

    // Prefer iconURL (center-cropped square) for circular avatars, fallback to photoURL
    const avatarSrc = user.iconURL || user.photoURL;
    if (avatarSrc) {
      return (
        <Image
          src={avatarSrc}
          alt={user.displayName ?? user.email ?? 'Account'}
          width={28}
          height={28}
          className="rounded-full object-cover"
          sizes="28px"
        />
      );
    }

    // Fallback to initials
    return (
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
    );
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-30 backdrop-blur-2xl border-b-2 border-amber-500 bg-zinc-100/95 dark:bg-zinc-950/90 dark:border-zinc-800"
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl 2xl:max-w-[1440px] items-center px-4 sm:px-6">
          {/* Left: Hamburger + Logo + Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onNavigationToggle}
              className="flex lg:hidden h-9 w-9 items-center justify-center rounded-full transition-colors bg-zinc-300/80 text-zinc-700 hover:bg-zinc-400/80 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
              aria-label="Toggle navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="hidden sm:block">
              <AinexStudiosLogo size="sm" align="center" asLink={true} appName={appName} appColor={appColor} />
            </div>

            {/* Breadcrumbs - Only show if provided */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <HeaderBreadcrumbs items={breadcrumbs} className="ml-2" />
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: Actions - Order: Search, Notifications, AI, Fullscreen, Theme, Profile */}
          <div className="flex items-center gap-3">
            {/* Search Button (opens command palette) */}
            <button
              type="button"
              onClick={() => setShowCommandPalette(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors text-zinc-500 hover:bg-zinc-300/80 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label="Search (⌘K)"
              title="Search (⌘K)"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notifications Bell */}
            {onNotificationsClick && (
              <NotificationBell
                count={notificationCount}
                onClick={onNotificationsClick}
                isOpen={isNotificationsOpen}
              />
            )}

            {/* AI Assistant Button */}
            <button
              type="button"
              onClick={onAiAssistantClick}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
              aria-label="AI Assistant"
              style={{
                backgroundColor: `${appColor || '#f59e0b'}20`,
                boxShadow: `0 0 12px ${appColor || '#f59e0b'}40`,
              }}
            >
              <MagicSparkMic size={24} color={appColor || '#f59e0b'} isAnimating={true} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors text-zinc-500 hover:bg-zinc-300/80 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>

            {/* Animated Theme Toggle */}
            <AnimatedThemeToggler />

            {/* Profile Sidebar Toggle */}
            <button
              type="button"
              className="flex items-center gap-2 h-9 rounded-full transition-colors px-2 bg-zinc-300/80 text-zinc-700 hover:bg-zinc-400/80 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              aria-label="Profile menu"
              onClick={onProfileToggle}
            >
              {renderUserAvatar()}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
          </div>
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
    </>
  );
}
