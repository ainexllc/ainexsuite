'use client';

import { ReactNode, useState } from 'react';
import { WorkspaceHeader } from './workspace-header';
import { AtmosphericGlows } from './atmospheric-glows';
import { FeedbackWidget } from '../feedback/feedback-widget';
import { SubscriptionSidebar } from '../layout/subscription-sidebar';
import { AppNavigationSidebar } from '../layout/app-navigation-sidebar';

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
}

/**
 * WorkspaceLayout Component
 *
 * The standard layout for all app workspaces.
 * Includes:
 * - Fixed WorkspaceHeader (TopNav)
 * - AtmosphericGlows (Background)
 * - Standardized content container
 * - FeedbackWidget (Floating)
 *
 * The theme colors are controlled by the app's CSS variables
 * (--theme-primary, --theme-secondary).
 */
export function WorkspaceLayout({
  children,
  user,
  onSignOut,
  searchPlaceholder,
  appName,
  appColor,
  showGlows = true,
  apps = [],
}: WorkspaceLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);

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
      />

      {/* App Navigation Sidebar */}
      {apps.length > 0 ? (
        <AppNavigationSidebar
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
          apps={apps}
          user={user}
        />
      ) : (
        /* Fallback to subscription sidebar if no apps provided */
        <SubscriptionSidebar
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
          user={user}
        />
      )}

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
