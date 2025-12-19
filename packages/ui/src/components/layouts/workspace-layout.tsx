'use client';

import { ReactNode, useState, useCallback } from 'react';
import { WorkspaceHeader } from './workspace-header';
import { WorkspaceBackground } from '../backgrounds/workspace-background';
import { FeedbackWidget } from '../feedback/feedback-widget';
// SubscriptionSidebar imported for future use
// import { SubscriptionSidebar } from '../layout/subscription-sidebar';
import { AppNavigationSidebar } from '../layout/app-navigation-sidebar';
import { ProfileSidebar } from '../layout/profile-sidebar';
import { NotificationDropdown } from '../navigation/notification-dropdown';
import { AIInsightsPulldown, type AIInsightsPulldownSection } from '../ai/ai-insights-pulldown';
import { getNavigationApps } from '../../utils/navigation';
import { useAutoHideNav } from '../../hooks/use-auto-hide-nav';
import { useAppTheme } from '@ainexsuite/theme';
import { useRealtimeThemeSync } from '../../hooks/use-realtime-theme-sync';
import type { NotificationItem, QuickAction, BreadcrumbItem } from '@ainexsuite/types';

interface WorkspaceLayoutProps {
  /**
   * The main content of the workspace
   */
  children: ReactNode;
  /**
   * User object for the profile sidebar
   */
  user: {
    uid?: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    subscriptionStatus?: string;
    subscriptionTier?: string;
    trialStartDate?: number;
  };
  /**
   * Function to handle sign out
   */
  onSignOut: () => void;
  /**
   * Name of the app (e.g. 'Projects', 'Notes')
   */
  appName?: string;
  /**
   * Color for the app name in the logo (e.g. '#8b5cf6')
   */
  appColor?: string;
  /**
   * Whether to show the background gradient
   * @default true
   */
  showBackground?: boolean;
  /**
   * Background style variant
   * - 'dots': Dot matrix pattern (default - professional and modern)
   * - 'minimal': Very subtle, single gradient
   * - 'grid': Subtle grid pattern with accent color highlights
   * @default 'dots'
   */
  backgroundVariant?: 'glow' | 'aurora' | 'minimal' | 'grid' | 'dots' | 'mesh';
  /**
   * Background gradient intensity (0.0 - 1.0)
   * @default 0.2
   */
  backgroundIntensity?: number;
  /**
   * Apps to show in the left navigation sidebar
   */
  apps?: Array<{
    name: string;
    slug: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }>;
  /**
   * Handler for clicking settings in the profile sidebar
   */
  onSettingsClick?: () => void;
  /**
   * Handler for clicking activity in the profile sidebar
   */
  onActivityClick?: () => void;
  /**
   * Optional custom sidebar renderer. If provided, it replaces the default AppNavigationSidebar.
   */
  renderSidebar?: (props: { isOpen: boolean; onClose: () => void }) => ReactNode;
  // NEW: Breadcrumbs
  /**
   * Breadcrumb items for navigation
   */
  breadcrumbs?: BreadcrumbItem[];
  // NEW: Notifications
  /**
   * Array of notification items
   */
  notifications?: NotificationItem[];
  /**
   * Callback when a notification is clicked
   */
  onNotificationClick?: (id: string) => void;
  /**
   * Callback to mark a notification as read
   */
  onMarkAsRead?: (id: string) => void;
  /**
   * Callback to mark all notifications as read
   */
  onMarkAllRead?: () => void;
  /**
   * Callback to clear all notifications
   */
  onClearAll?: () => void;
  /**
   * Callback to view all notifications
   */
  onViewAllNotifications?: () => void;
  // NEW: Quick Actions
  /**
   * Quick actions for the app
   */
  quickActions?: QuickAction[];
  /**
   * Callback when a quick action is selected
   */
  onQuickAction?: (actionId: string) => void;
  // NEW: AI Assistant
  /**
   * Callback when AI assistant button is clicked
   */
  onAiAssistantClick?: () => void;
  // AI Insights Pulldown props
  /**
   * Sections for AI Insights Pulldown. If provided, shows the pulldown handle.
   */
  insightsSections?: AIInsightsPulldownSection[];
  /**
   * Title for the AI Insights Pulldown
   */
  insightsTitle?: string;
  /**
   * Whether AI insights are loading
   */
  insightsLoading?: boolean;
  /**
   * Loading message for AI insights
   */
  insightsLoadingMessage?: string;
  /**
   * Error message for AI insights
   */
  insightsError?: string | null;
  /**
   * Last updated timestamp for AI insights
   */
  insightsLastUpdated?: Date | null;
  /**
   * Callback when AI insights refresh is clicked
   */
  onInsightsRefresh?: () => void;
  /**
   * Whether insights refresh is disabled
   */
  insightsRefreshDisabled?: boolean;
  /**
   * Storage key for insights collapse state persistence (defaults to `${appName}-ai-insights-expanded`)
   */
  insightsStorageKey?: string;
  /**
   * Default expanded state for insights (default: false - collapsed)
   */
  insightsDefaultExpanded?: boolean;
  /**
   * Callback when "View Details" is clicked in AI insights
   */
  onInsightsViewDetails?: () => void;
  /**
   * Callback to update user preferences (e.g. theme)
   */
  onUpdatePreferences?: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
}

export function WorkspaceLayout({
  children,
  user,
  onSignOut,
  appName,
  appColor,
  showBackground = true,
  backgroundVariant: propBackgroundVariant,
  backgroundIntensity: propBackgroundIntensity,
  apps = [],
  onSettingsClick,
  onActivityClick,
  renderSidebar,
  breadcrumbs,
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onMarkAllRead,
  onClearAll,
  onViewAllNotifications,
  quickActions = [],
  onQuickAction,
  onAiAssistantClick,
  // AI Insights Pulldown props
  insightsSections,
  insightsTitle,
  insightsLoading,
  insightsLoadingMessage,
  insightsError,
  insightsLastUpdated,
  onInsightsRefresh,
  insightsRefreshDisabled,
  insightsStorageKey,
  insightsDefaultExpanded,
  onInsightsViewDetails,
  onUpdatePreferences,
}: WorkspaceLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);

  // Real-time theme sync: bidirectional sync with Firestore for cross-device theme
  // Also syncs local theme changes TO Firestore automatically
  useRealtimeThemeSync({
    uid: user.uid,
    updatePreferences: onUpdatePreferences as ((updates: { theme: string }) => Promise<void>) | undefined,
  });

  // Get global theme settings (from AppColorProvider context)
  const appTheme = useAppTheme();

  // Use global theme settings if available, otherwise fall back to props/defaults
  // Default to 'dots' for a professional, modern look
  const backgroundVariant = propBackgroundVariant ?? appTheme.backgroundVariant ?? 'dots';
  const backgroundIntensity = propBackgroundIntensity ?? appTheme.backgroundIntensity ?? 0.2;

  // Auto-hide navigation hook
  const {
    isVisible: isNavVisible,
    autoHideEnabled,
    toggleAutoHide,
    headerProps,
    hoverZoneProps,
  } = useAutoHideNav();

  // Generate default apps list if none provided
  // Use the environment-aware helper to get consistent apps config
  // Pass user email for access control filtering (e.g., admin app restricted to certain users)
  const defaultApps = getNavigationApps(process.env.NODE_ENV === 'development', user.email);
  const displayApps = apps.length > 0 ? apps : defaultApps;

  // Notification count for the bell icon
  const notificationCount = notifications.filter((n) => !n.read).length;

  // Toggle handlers
  const handleNotificationsToggle = useCallback(() => {
    setIsNotificationsOpen((prev) => !prev);
    // Close quick actions if opening notifications
    if (!isNotificationsOpen) {
      setIsQuickActionsOpen(false);
    }
  }, [isNotificationsOpen]);

  const handleQuickActionsToggle = useCallback(() => {
    setIsQuickActionsOpen((prev) => !prev);
    // Close notifications if opening quick actions
    if (!isQuickActionsOpen) {
      setIsNotificationsOpen(false);
    }
  }, [isQuickActionsOpen]);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-text-primary">
      {/* Base background color */}
      <div className="fixed inset-0 -z-20 bg-surface-base" />

      {/* Background Effects */}
      {showBackground && <WorkspaceBackground variant={backgroundVariant} intensity={backgroundIntensity} />}

      {/* Hover Zone for auto-hide reveal */}
      <div {...hoverZoneProps} />

      {/* Header */}
      <WorkspaceHeader
        user={user}
        onSignOut={onSignOut}
        appName={appName}
        appColor={appColor}
        onNavigationToggle={() => setIsNavOpen(!isNavOpen)}
        onProfileToggle={() => setIsProfileOpen(!isProfileOpen)}
        isVisible={isNavVisible}
        autoHideEnabled={autoHideEnabled}
        onAutoHideToggle={toggleAutoHide}
        headerMouseProps={headerProps}
        breadcrumbs={breadcrumbs}
        notificationCount={notificationCount}
        onNotificationsClick={handleNotificationsToggle}
        isNotificationsOpen={isNotificationsOpen}
        quickActions={quickActions}
        onQuickAction={onQuickAction}
        isQuickActionsOpen={isQuickActionsOpen}
        onQuickActionsToggle={handleQuickActionsToggle}
        onAiAssistantClick={onAiAssistantClick}
      />

      {/* Sidebar (Custom or Default) */}
      {renderSidebar ? (
        renderSidebar({ isOpen: isNavOpen, onClose: () => setIsNavOpen(false) })
      ) : (
        <AppNavigationSidebar
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
          apps={displayApps}
          user={user}
        />
      )}

      {/* Profile Sidebar - slide-in panel from the right */}
      <ProfileSidebar
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onSignOut={onSignOut}
        onSettingsClick={onSettingsClick}
        onActivityClick={onActivityClick}
        onThemeChange={() => {
          // Theme changes are now automatically synced to Firestore by useRealtimeThemeSync
          // No need to manually call onUpdatePreferences - the hook detects next-themes changes
        }}
      />

      {/* Notifications Dropdown (positioned absolutely, rendered here for portal-like behavior) */}
      {isNotificationsOpen && notifications.length >= 0 && (
        <div className="fixed top-16 right-4 z-50 sm:right-6">
          <NotificationDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            items={notifications}
            onNotificationClick={onNotificationClick}
            onMarkAsRead={onMarkAsRead}
            onMarkAllRead={onMarkAllRead}
            onClearAll={onClearAll}
            onViewAll={onViewAllNotifications}
          />
        </div>
      )}

      {/* AI Insights Pulldown - positioned under the header */}
      {insightsSections && (
        <div
          className={`fixed left-0 right-0 z-30 transition-all duration-300 ${isProfileOpen ? 'blur-sm opacity-50 pointer-events-none' : ''}`}
          style={{ top: isNavVisible ? '4rem' : '0' }}
        >
          <AIInsightsPulldown
            title={insightsTitle}
            sections={insightsSections}
            accentColor={appColor || '#eab308'}
            isLoading={insightsLoading}
            loadingMessage={insightsLoadingMessage}
            error={insightsError}
            lastUpdated={insightsLastUpdated}
            onRefresh={onInsightsRefresh}
            refreshDisabled={insightsRefreshDisabled}
            storageKey={insightsStorageKey || `${appName || 'app'}-ai-insights-expanded`}
            defaultExpanded={insightsDefaultExpanded}
            onExpandedChange={setIsInsightsExpanded}
            onViewDetails={onInsightsViewDetails}
          />
        </div>
      )}

      {/* Main Content - adjusts padding based on header visibility and insights expanded state */}
      {/* When expanded: panel height (100-180px responsive) + tab handle (28-36px responsive) + accent line (2px) */}
      <main
        className={`flex-1 transition-[padding-top] duration-300 ${
          insightsSections
            ? isInsightsExpanded
              ? isNavVisible
                ? 'pt-[calc(4rem+132px)] sm:pt-[calc(4rem+160px)] lg:pt-[calc(4rem+180px)] xl:pt-[calc(4rem+200px)] 2xl:pt-[calc(4rem+220px)]'
                : 'pt-[132px] sm:pt-[160px] lg:pt-[180px] xl:pt-[200px] 2xl:pt-[220px]'
              : isNavVisible
                ? 'pt-[calc(4rem+24px)] sm:pt-[calc(4rem+36px)]'
                : 'pt-[24px] sm:pt-[36px]'
            : isNavVisible
              ? 'pt-16'
              : 'pt-0'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 pt-2 sm:pt-4 pb-12 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          {children}
        </div>
      </main>

      {/* Global Feedback Widget */}
      <FeedbackWidget
        userId={user.uid}
        userEmail={user.email || undefined}
        userName={user.displayName || undefined}
        appName={appName || 'Unknown App'}
      />
    </div>
  );
}
