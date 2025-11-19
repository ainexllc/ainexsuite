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
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        if (userData?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Failed to verify admin role:', error);
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
    return <div className="bg-zinc-950 min-h-screen text-zinc-50">{children}</div>;
  }

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-zinc-500 text-sm">Verifying privileges...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 space-y-4 p-4 text-center">
        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-2">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="max-w-md">
          You do not have administrative privileges. This area is restricted to authorized personnel only.
        </p>
        <button 
          onClick={() => router.push('/login')}
          className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors font-medium"
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
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
      <AdminSidebar onSignOut={handleSignOut} />
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
