'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, Cpu, Lock } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />

        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
              <Cpu className="h-10 w-10 text-cyan-400 animate-pulse" />
            </div>
            <div className="absolute -inset-4 rounded-3xl border border-cyan-500/20 animate-ping" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-orbitron font-bold text-white tracking-wider mb-2">
              AINEX CONTROL
            </h2>
            <p className="text-cyan-400 text-sm font-mono animate-pulse">
              Verifying privileges...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] text-white p-4 text-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-md">
          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 mb-6 inline-block shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="h-16 w-16 text-red-500" />
          </div>

          <h1 className="text-3xl font-orbitron font-bold text-red-400 tracking-wider mb-4">
            ACCESS DENIED
          </h1>

          <div className="cyber-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <Lock className="h-5 w-5" />
              <span className="font-mono text-sm uppercase tracking-wider">Authorization Failed</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              You do not have administrative privileges. This area is restricted to authorized personnel only.
            </p>
          </div>

          <button
            onClick={() => router.push('/login')}
            className="neon-button text-cyan-400 hover:text-black"
          >
            <span>Sign in as Admin</span>
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
    <div className="flex min-h-screen bg-transparent text-white overflow-hidden relative font-jetbrains selection:bg-cyan-500/30">
      <AdminSidebar onSignOut={handleSignOut} />

      <main className="flex-1 overflow-y-auto h-screen relative z-10 scrollbar-thin">
        <div className="p-6 md:p-8 max-w-[1800px] mx-auto md:pt-4 pt-20">
          {children}
        </div>
      </main>
    </div>
  );
}
