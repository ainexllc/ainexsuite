'use client';

import { ReactNode, useState, useCallback, useEffect } from 'react';
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
import { useAppTheme } from '@ainexsuite/theme';
import { useRealtimeThemeSync } from '../../hooks/use-realtime-theme-sync';
import type { NotificationItem, QuickAction, BreadcrumbItem } from '@ainexsuite/types';

// Storage key for tracking first-time AI Insights user
const INSIGHTS_FIRST_TIME_KEY = 'ainex-ai-insights-first-time-seen';

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
    /** Square-cropped icon URL for circular avatars */
    iconURL?: string | null;
    subscriptionStatus?: string;
    subscriptionTier?: string;
    trialStartDate?: number;
    // Animated avatar fields
    animatedAvatarURL?: string | null;
    useAnimatedAvatar?: boolean;
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
  /**
   * Callback when a space invitation is accepted
   */
  onAcceptInvitation?: (invitationId: string, notificationId: string) => Promise<void>;
  /**
   * Callback when a space invitation is declined
   */
  onDeclineInvitation?: (invitationId: string, notificationId: string) => Promise<void>;
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
  /**
   * Custom message to show when there's not enough data for insights
   */
  insightsEmptyStateMessage?: string;
  /**
   * Whether to use full-width layout (edge-to-edge content)
   * @default false
   */
  fullWidth?: boolean;
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
  onAcceptInvitation,
  onDeclineInvitation,
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
  insightsEmptyStateMessage,
  fullWidth = false,
}: WorkspaceLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Compute the storage key for insights
  const computedStorageKey = insightsStorageKey || `${appName || 'app'}-ai-insights-expanded`;

  // Initialize isInsightsExpanded synchronously to match pulldown's behavior
  // This prevents the flash where panel is expanded but content hasn't adjusted
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(computedStorageKey);
      // Default to true (expanded) for new users, respect stored preference otherwise
      return stored === null ? true : stored === 'true';
    }
    return true; // Default to expanded for SSR
  });

  // Sync isInsightsExpanded when storage key changes or on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && computedStorageKey) {
      const stored = localStorage.getItem(computedStorageKey);
      const expanded = stored === null ? true : stored === 'true';
      setIsInsightsExpanded(expanded);
    }
  }, [computedStorageKey]);

  // Check if first-time user for AI Insights welcome message
  useEffect(() => {
    if (typeof window !== 'undefined' && insightsSections) {
      const hasSeenInsights = localStorage.getItem(INSIGHTS_FIRST_TIME_KEY);
      if (!hasSeenInsights) {
        setIsFirstTimeUser(true);
        // Mark as seen after a short delay (so they see the welcome)
        const timer = setTimeout(() => {
          localStorage.setItem(INSIGHTS_FIRST_TIME_KEY, 'true');
        }, 10000); // Mark as seen after 10 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [insightsSections]);

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

      {/* Header */}
      <WorkspaceHeader
        user={user}
        onSignOut={onSignOut}
        appName={appName}
        appColor={appColor}
        onNavigationToggle={() => setIsNavOpen(!isNavOpen)}
        onProfileToggle={() => setIsProfileOpen(!isProfileOpen)}
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
            onAcceptInvitation={onAcceptInvitation}
            onDeclineInvitation={onDeclineInvitation}
          />
        </div>
      )}

      {/* AI Insights Pulldown - positioned under the header */}
      {insightsSections && (
        <div
          className={`fixed left-0 right-0 z-30 transition-[opacity,filter] duration-300 ${isProfileOpen ? 'blur-sm opacity-50 pointer-events-none' : ''}`}
          style={{ top: '4rem' }}
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
            storageKey={computedStorageKey}
            defaultExpanded={insightsDefaultExpanded}
            onExpandedChange={setIsInsightsExpanded}
            onViewDetails={onInsightsViewDetails}
            isFirstTimeUser={isFirstTimeUser}
            onDismissFirstTime={() => {
              setIsFirstTimeUser(false);
              localStorage.setItem(INSIGHTS_FIRST_TIME_KEY, 'true');
            }}
            emptyStateMessage={insightsEmptyStateMessage}
          />
        </div>
      )}

      {/* Main Content - adjusts padding based on insights expanded state */}
      {/* When expanded: panel (80-120px) + tab (~28-36px) + accent (2px) + 25px gap = 135-183px */}
      {/* When collapsed: accent (2px) + tab (~28-36px) + 25px gap = 55-63px */}
      {/* Duration matches AIInsightsPulldown animation (500ms) for smooth sync */}
      <main
        className={`flex-1 transition-[padding-top] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          insightsSections
            ? isInsightsExpanded
              ? 'pt-[calc(4rem+135px)] sm:pt-[calc(4rem+149px)] lg:pt-[calc(4rem+159px)] xl:pt-[calc(4rem+173px)] 2xl:pt-[calc(4rem+183px)]'
              : 'pt-[calc(4rem+55px)] sm:pt-[calc(4rem+63px)]'
            : 'pt-16'
        }`}
      >
        <div className={fullWidth ? "px-4 pb-12 sm:px-6 lg:px-8" : "mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 2xl:max-w-[1440px]"}>
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
