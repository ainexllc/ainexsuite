'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { db } from '@ainexsuite/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AdminSidebar } from '@/components/sidebar';

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (isLoginPage) {
      setCheckingRole(false);
      return;
    }

    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const checkAdminRole = async () => {
      if (!user) return;
      try {
        // For development, temporarily allow all authenticated users
        // TODO: Restore proper admin role checking for production
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment) {
          setIsAdmin(true);
          setCheckingRole(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        if (userData?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    if (user) {
      checkAdminRole();
    }
  }, [user, loading, router, isLoginPage]);

  // If on login page, just render children (the login page)
  if (isLoginPage) {
    return <div className="bg-surface-base min-h-screen text-ink-900">{children}</div>;
  }

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--theme-primary))]" />
          <p className="text-ink-500 text-sm">Verifying privileges...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-base text-ink-500 space-y-4 p-4 text-center">
        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-2">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900">Access Denied</h1>
        <p className="max-w-md text-ink-600">
          You do not have administrative privileges. This area is restricted to authorized personnel only.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-6 py-2 bg-surface-elevated hover:bg-surface-muted rounded-lg text-ink-900 transition-colors font-medium border border-outline-subtle"
        >
          Sign in as Admin
        </button>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push('/login');
    } catch (error) {
      // Ignore sign out error
    }
  };

  return (
    <div className="flex min-h-screen bg-[#030303] text-white overflow-hidden relative font-mono selection:bg-cyan-500/30">
      {/* Global Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Hex Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Orbs */}
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse duration-[4s]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-cyan-600/10 rounded-full blur-[80px] animate-pulse duration-[5s]" />
      </div>

      <AdminSidebar onSignOut={handleSignOut} />
      
      <main className="flex-1 overflow-y-auto h-screen relative z-10 scrollbar-hide">
        <div className="p-4 max-w-[1800px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
