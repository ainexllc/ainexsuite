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
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-lg backdrop-blur-sm shadow-md border border-border transition bg-background/95 hover:bg-accent text-foreground"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
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
        className={`fixed inset-x-0 top-0 z-30 backdrop-blur-2xl border-b border-border-secondary transition-transform duration-300 ease-in-out bg-white/80 dark:bg-zinc-950/90 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
        {...headerMouseProps}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl 2xl:max-w-[1440px] items-center px-4 sm:px-6">
          {/* Left: Hamburger + Logo + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigationToggle}
              className="flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition bg-secondary text-foreground hover:bg-accent"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
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
          <div className="flex items-center gap-2">
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
                className={`hidden lg:flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all hover:bg-accent ${autoHideEnabled ? 'bg-[rgba(var(--theme-primary-rgb),0.15)] text-[var(--theme-primary)]' : 'text-muted-foreground'
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
              className="flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all bg-[rgba(var(--theme-primary-rgb),0.12)] dark:bg-[rgba(var(--theme-primary-rgb),0.15)] text-[var(--theme-primary)] hover:opacity-80"
              aria-label="AI Assistant"
            >
              <Sparkles className="h-4 w-4" />
            </button>

            {/* Profile Sidebar Toggle */}
            <button
              type="button"
              className="flex items-center gap-2 h-9 rounded-full shadow-sm transition px-2 bg-secondary text-secondary-foreground hover:bg-accent"
              aria-label="Profile menu"
              onClick={onProfileToggle}
            >
              {renderUserAvatar()}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
