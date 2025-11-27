'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, Cpu } from 'lucide-react';
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

  // If on login page, just render children
  if (isLoginPage) {
    return <div className="bg-[#0a0a0f] min-h-screen text-white">{children}</div>;
  }

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-zinc-500/20 blur-xl rounded-full"></div>
            <Cpu className="h-8 w-8 text-zinc-400 animate-pulse relative z-10" />
          </div>
          <p className="text-zinc-500 text-sm font-medium animate-pulse">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-4 text-center">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-white/5">
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
            onClick={() => router.push('/login')}
            className="w-full py-2.5 px-4 bg-white text-zinc-950 font-medium rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Sign in as Admin
          </button>
        </div>
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
    <div className="flex min-h-screen bg-transparent text-zinc-100 overflow-hidden relative selection:bg-white/20">
      <AdminSidebar onSignOut={handleSignOut} userEmail={user?.email} />

      <main className="flex-1 overflow-y-auto h-screen relative z-10">
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto md:pt-6 pt-20">
          {children}
        </div>
      </main>
    </div>
  );
}
