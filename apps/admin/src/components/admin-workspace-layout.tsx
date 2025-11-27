'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { db } from '@ainexsuite/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AdminWorkspaceLayoutProps {
  children: ReactNode;
}

export function AdminWorkspaceLayout({ children }: AdminWorkspaceLayoutProps) {
  const { user, loading, ssoInProgress, bootstrapStatus } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

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
      await (firebaseAuth as any).signOut(auth);
      const isDev = process.env.NODE_ENV === 'development';
      window.location.href = isDev ? 'http://localhost:3000' : 'https://www.ainexsuite.com';
    } catch {
      // Ignore sign out error
    }
  };

  // Loading state
  if (loading || ssoInProgress || bootstrapStatus === 'running' || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-zinc-500 text-sm">Loading Admin Console...</p>
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

          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            You do not have administrative privileges. This area is restricted to authorized personnel only.
          </p>

          <button
            onClick={() => {
              const isDev = process.env.NODE_ENV === 'development';
              window.location.href = isDev ? 'http://localhost:3000' : 'https://www.ainexsuite.com';
            }}
            className="w-full py-2.5 px-4 bg-white text-zinc-950 font-medium rounded-lg hover:bg-zinc-200 transition-colors"
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
      backgroundVariant="minimal"
      backgroundIntensity={0.3}
    >
      {children}
    </WorkspaceLayout>
  );
}
