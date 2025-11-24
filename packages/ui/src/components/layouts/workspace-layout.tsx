'use client';

import { ReactNode, useState } from 'react';
import { WorkspaceHeader } from './workspace-header';
import { AtmosphericGlows } from './atmospheric-glows';
import { FeedbackWidget } from '../feedback/feedback-widget';
import { SubscriptionSidebar } from '../layout/subscription-sidebar';
import { AppNavigationSidebar } from '../layout/app-navigation-sidebar';
import { ProfileSidebar } from '../layout/profile-sidebar';
import { getNavigationApps } from '../../utils/navigation';

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
   * Whether to show the atmospheric background glows
   * @default true
   */
  showGlows?: boolean;
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
  showGlows = true,
  apps = [],
  onSettingsClick,
  onActivityClick,
  renderSidebar,
}: WorkspaceLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Generate default apps list if none provided
  // Use the environment-aware helper to get consistent apps config
  const defaultApps = getNavigationApps(process.env.NODE_ENV === 'development');
  const displayApps = apps.length > 0 ? apps : defaultApps;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface-base text-text-primary">
      {/* Background Effects */}
      {showGlows && <AtmosphericGlows />}

      {/* Header */}
      <WorkspaceHeader
        user={user}
        onSignOut={onSignOut}
        searchPlaceholder={searchPlaceholder}
        appName={appName}
        appColor={appColor}
        onNavigationToggle={() => setIsNavOpen(!isNavOpen)}
        onProfileToggle={() => setIsProfileOpen(!isProfileOpen)}
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
      <main className="flex-1 pt-16">
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
