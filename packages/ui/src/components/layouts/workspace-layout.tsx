'use client';

import { ReactNode, useState } from 'react';
import { WorkspaceHeader } from './workspace-header';
import { WorkspaceBackground } from '../backgrounds/workspace-background';
import { FeedbackWidget } from '../feedback/feedback-widget';
// SubscriptionSidebar imported for future use
// import { SubscriptionSidebar } from '../layout/subscription-sidebar';
import { AppNavigationSidebar } from '../layout/app-navigation-sidebar';
import { ProfileSidebar } from '../layout/profile-sidebar';
import { getNavigationApps } from '../../utils/navigation';
import { useAutoHideNav } from '../../hooks/use-auto-hide-nav';
import { useAppTheme } from '@ainexsuite/theme';

interface WorkspaceLayoutProps {
  /**
   * The main content of the workspace
   */
  children: ReactNode;
  /**
   * User object for the profile dropdown
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
   * Placeholder text for the search bar
   */
  searchPlaceholder?: string;
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
}

export function WorkspaceLayout({
  children,
  user,
  onSignOut,
  searchPlaceholder,
  appName,
  appColor,
  showBackground = true,
  backgroundVariant: propBackgroundVariant,
  backgroundIntensity: propBackgroundIntensity,
  apps = [],
  onSettingsClick,
  onActivityClick,
  renderSidebar,
}: WorkspaceLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
        searchPlaceholder={searchPlaceholder}
        appName={appName}
        appColor={appColor}
        onNavigationToggle={() => setIsNavOpen(!isNavOpen)}
        onProfileToggle={() => setIsProfileOpen(!isProfileOpen)}
        isVisible={isNavVisible}
        autoHideEnabled={autoHideEnabled}
        onAutoHideToggle={toggleAutoHide}
        headerMouseProps={headerProps}
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

      {/* Profile Sidebar */}
      <ProfileSidebar
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onSignOut={onSignOut}
        onSettingsClick={onSettingsClick}
        onActivityClick={onActivityClick}
      />

      {/* Main Content */}
      <main
        className="flex-1 transition-[padding-top] duration-300"
        style={{ paddingTop: isNavVisible ? '4rem' : '0' }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
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
