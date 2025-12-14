'use client';

import { Menu, Sparkles, ChevronDown, PanelTopClose, PanelTop } from 'lucide-react';
import Image from 'next/image';
import { AinexStudiosLogo } from '../branding/ainex-studios-logo';
import { HeaderBreadcrumbs } from '../navigation/header-breadcrumbs';
import { NotificationBell } from '../navigation/notification-bell';
import { QuickActionsMenu } from '../navigation/quick-actions-menu';
import type { BreadcrumbItem, QuickAction } from '@ainexsuite/types';

interface WorkspaceHeaderProps {
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    subscriptionStatus?: string;
    subscriptionTier?: string;
    trialStartDate?: number;
  };
  onSignOut: () => void;
  appName?: string;
  appColor?: string;
  onNavigationToggle?: () => void;
  onProfileToggle?: () => void;
  /**
   * Whether the header is currently visible (for auto-hide feature)
   */
  isVisible?: boolean;
  /**
   * Whether auto-hide is enabled
   */
  autoHideEnabled?: boolean;
  /**
   * Callback to toggle auto-hide
   */
  onAutoHideToggle?: () => void;
  /**
   * Props to spread on the header for mouse events
   */
  headerMouseProps?: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
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
  isVisible = true,
  autoHideEnabled = false,
  onAutoHideToggle,
  headerMouseProps,
  breadcrumbs,
  notificationCount = 0,
  onNotificationsClick,
  isNotificationsOpen = false,
  quickActions = [],
  onQuickAction,
  isQuickActionsOpen = false,
  onQuickActionsToggle,
  onAiAssistantClick,
}: WorkspaceHeaderProps) {
  // Render user avatar/initials (shared between header and floating controls)
  const renderUserAvatar = () => (
    user.photoURL ? (
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
    )
  );

  return (
    <>
      {/* Floating controls when header is hidden (auto-hide mode) */}
      {autoHideEnabled && !isVisible && (
        <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
          <div className="mx-auto flex h-16 w-full max-w-7xl 2xl:max-w-[1440px] items-center justify-between px-4 sm:px-6">
            {/* Hamburger - left */}
            <button
              type="button"
              onClick={onNavigationToggle}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm shadow-md border border-border transition bg-background/95 hover:bg-accent text-foreground"
              aria-label="Toggle navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Profile - right */}
            <button
              type="button"
              className="pointer-events-auto flex items-center gap-2 h-9 rounded-full backdrop-blur-sm shadow-md border border-border transition px-2 bg-background/95 hover:bg-accent text-foreground"
              aria-label="Profile menu"
              onClick={onProfileToggle}
            >
              {renderUserAvatar()}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      <header
        className={`fixed inset-x-0 top-0 z-30 backdrop-blur-2xl border-b-2 border-amber-500 transition-transform duration-300 ease-in-out bg-zinc-100/95 dark:bg-zinc-950/90 dark:border-zinc-800 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
        {...headerMouseProps}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl 2xl:max-w-[1440px] items-center px-4 sm:px-6">
          {/* Left: Hamburger + Logo + Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onNavigationToggle}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all bg-zinc-300/80 text-zinc-700 hover:bg-zinc-400/80 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
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

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            {onNotificationsClick && (
              <NotificationBell
                count={notificationCount}
                onClick={onNotificationsClick}
                isOpen={isNotificationsOpen}
              />
            )}

            {/* Auto-hide Toggle (desktop only) */}
            {onAutoHideToggle && (
              <button
                type="button"
                onClick={onAutoHideToggle}
                className={`hidden lg:flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                  autoHideEnabled
                    ? 'bg-amber-200 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    : 'text-zinc-500 hover:bg-zinc-300/80 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'
                }`}
                aria-label={autoHideEnabled ? 'Disable auto-hide navbar' : 'Enable auto-hide navbar'}
                title={autoHideEnabled ? 'Disable auto-hide (Cmd+\\)' : 'Enable auto-hide (Cmd+\\)'}
              >
                {autoHideEnabled ? (
                  <PanelTopClose className="h-4 w-4" />
                ) : (
                  <PanelTop className="h-4 w-4" />
                )}
              </button>
            )}

            {/* AI Assistant Button */}
            <button
              type="button"
              onClick={onAiAssistantClick}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all bg-amber-200 text-amber-700 hover:bg-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30"
              aria-label="AI Assistant"
            >
              <Sparkles className="h-4 w-4" />
            </button>

            {/* Profile Sidebar Toggle */}
            <button
              type="button"
              className="flex items-center gap-2 h-9 rounded-full transition-all px-2 bg-zinc-300/80 text-zinc-700 hover:bg-zinc-400/80 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              aria-label="Profile menu"
              onClick={onProfileToggle}
            >
              {renderUserAvatar()}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
