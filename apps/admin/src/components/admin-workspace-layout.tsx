'use client';

/**
 * AdminWorkspaceLayout - TailAdmin-inspired layout with fixed sidebar
 * Full browser width with sidebar on left, content on right
 */

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useFontPreference, useFontSizePreference } from '@ainexsuite/ui';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { db } from '@ainexsuite/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useFeedbackNotifications } from '@/hooks/use-feedback-notifications';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';

interface AdminWorkspaceLayoutProps {
  children: ReactNode;
}

export function AdminWorkspaceLayout({ children }: AdminWorkspaceLayoutProps) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Feedback notifications hook
  const { notifications } = useFeedbackNotifications();

  // Sync user font preferences from Firestore
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
    } else if (!loading) {
      setCheckingRole(false);
    }
  }, [user, loading]);

  // Redirect to main app if not authenticated
  useEffect(() => {
    if (!loading && !user && !checkingRole) {
      const isDev = process.env.NODE_ENV === 'development';
      window.location.href = isDev ? 'http://localhost:3000' : 'https://www.ainexspace.com';
    }
  }, [user, loading, checkingRole]);

  // Get unread notification count
  const notificationCount = notifications.filter(n => !n.read).length;

  // Loading state
  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500 dark:text-[#a1a1aa]" />
          <p className="text-zinc-500 dark:text-[#a1a1aa] text-sm">Loading Admin Console...</p>
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-100 dark:bg-[#09090b] p-4">
        <div className="bg-white dark:bg-[#18181b] p-8 rounded-2xl max-w-md w-full border border-zinc-200 dark:border-[#27272a] text-center shadow-sm dark:shadow-none">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-red-500/10 text-red-500">
              <ShieldAlert className="h-10 w-10" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">
            Access Restricted
          </h1>

          <p className="text-zinc-500 dark:text-[#a1a1aa] text-sm mb-8 leading-relaxed">
            You do not have administrative privileges. This area is restricted to authorized personnel only.
          </p>

          <button
            onClick={() => {
              const isDev = process.env.NODE_ENV === 'development';
              window.location.href = isDev ? 'http://localhost:3000' : 'https://www.ainexspace.com';
            }}
            className="w-full py-2.5 px-4 bg-[#3b82f6] text-white font-medium rounded-lg hover:bg-[#2563eb] transition-colors"
          >
            Return to Space Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b]">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area - offset by sidebar width on large screens */}
      <div className="lg:ml-[280px] min-h-screen flex flex-col">
        {/* Header */}
        <AdminHeader
          user={user}
          onSidebarToggle={() => setSidebarOpen(true)}
          notificationCount={notificationCount}
        />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
