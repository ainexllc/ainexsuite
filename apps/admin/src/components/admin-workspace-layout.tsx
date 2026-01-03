'use client';

/**
 * AdminWorkspaceLayout - Uses shared AppNavigationSidebar from @ainexsuite/ui
 * Same hamburger menu slide-in as all other apps in the suite
 */

import { ReactNode, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, useFontPreference, useFontSizePreference } from '@ainexsuite/ui';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { db } from '@ainexsuite/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useFeedbackNotifications } from '@/hooks/use-feedback-notifications';

interface AdminWorkspaceLayoutProps {
  children: ReactNode;
}

export function AdminWorkspaceLayout({ children }: AdminWorkspaceLayoutProps) {
  const { user, loading, ssoInProgress, bootstrapStatus, updatePreferences } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const router = useRouter();

  // Feedback notifications hook
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useFeedbackNotifications();

  // Sync user font preferences from Firestore (theme sync is handled by WorkspaceLayout)
  useFontPreference(user?.preferences?.fontFamily);
  useFontSizePreference(user?.preferences?.fontSize);

  // Check admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      try {
        // For development, temporarily allow all authenticated users
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment) {
          setIsAdmin(true);
          setCheckingRole(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        setIsAdmin(userData?.role === 'admin');
      } catch {
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    if (user && !loading) {
      checkAdminRole();
    } else if (!loading && !ssoInProgress && bootstrapStatus !== 'running') {
      setCheckingRole(false);
    }
  }, [user, loading, ssoInProgress, bootstrapStatus]);

  // Redirect to main app if not authenticated
  useEffect(() => {
    if (!loading && !ssoInProgress && !user && bootstrapStatus !== 'running' && !checkingRole) {
      const isDev = process.env.NODE_ENV === 'development';
      window.location.href = isDev ? 'http://localhost:3000' : 'https://www.ainexsuite.com';
    }
  }, [user, loading, ssoInProgress, bootstrapStatus, checkingRole]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      await firebaseAuth.signOut(auth);
      const isDev = process.env.NODE_ENV === 'development';
      window.location.href = isDev ? 'http://localhost:3000' : 'https://www.ainexsuite.com';
    } catch {
      // Ignore sign out error
    }
  };

  // Handle notification click - navigate to feedback page and mark as read
  const handleNotificationClick = useCallback((id: string) => {
    markAsRead(id);
    router.push('/workspace/feedback');
  }, [markAsRead, router]);

  // Handle view all notifications - navigate to feedback page
  const handleViewAllNotifications = useCallback(() => {
    router.push('/workspace/feedback');
  }, [router]);

  // Loading state
  if (loading || ssoInProgress || bootstrapStatus === 'running' || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-base text-white p-4">
        <div className="glass-card p-8 rounded-2xl max-w-md w-full border border-white/10 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-red-500/10 text-red-500">
              <ShieldAlert className="h-10 w-10" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-white mb-2">
            Access Restricted
          </h1>

          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            You do not have administrative privileges. This area is restricted to authorized personnel only.
          </p>

          <button
            onClick={() => {
              const isDev = process.env.NODE_ENV === 'development';
              window.location.href = isDev ? 'http://localhost:3000' : 'https://www.ainexsuite.com';
            }}
            className="w-full py-2.5 px-4 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            Return to Suite Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      appName="ADMIN"
      appColor="#71717a"
      showBackground={true}
      onUpdatePreferences={updatePreferences}
      notifications={notifications}
      onNotificationClick={handleNotificationClick}
      onMarkAsRead={markAsRead}
      onMarkAllRead={markAllAsRead}
      onClearAll={clearAll}
      onViewAllNotifications={handleViewAllNotifications}
    >
      {children}
    </WorkspaceLayout>
  );
}
