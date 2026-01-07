'use client';

import { useState, useCallback } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import {
  WorkspaceHeader,
  WorkspaceBackground,
  FeedbackWidget,
  AppNavigationSidebar,
  ProfileSidebar,
  getNavigationApps,
} from '@ainexsuite/ui';

/**
 * Custom layout for the workflow editor that uses full width
 * without the max-width constraints of WorkspaceLayout
 */
export default function WorkflowEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, handleSignOut } = useWorkspaceAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleNavToggle = useCallback(() => setIsNavOpen((prev) => !prev), []);
  const handleProfileToggle = useCallback(() => setIsProfileOpen((prev) => !prev), []);

  if (!user) return null;

  const apps = getNavigationApps();

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background */}
      <WorkspaceBackground variant="dots" intensity={0.15} />

      {/* Header - z-50 to stay above ReactFlow controls */}
      <WorkspaceHeader
        user={user}
        onSignOut={handleSignOut}
        appName="workflow"
        onNavigationToggle={handleNavToggle}
        onProfileToggle={handleProfileToggle}
      />

      {/* Left Navigation Sidebar */}
      <AppNavigationSidebar
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        apps={apps}
        user={user}
      />

      {/* Right Profile Sidebar */}
      <ProfileSidebar
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Full-width main content for canvas - isolate stacking context */}
      <main className="pt-16 relative z-0 isolate">
        {children}
      </main>

      {/* Feedback Widget */}
      <FeedbackWidget
        userId={user.uid}
        userEmail={user.email || undefined}
        userName={user.displayName || undefined}
        appName="workflow"
      />
    </div>
  );
}
