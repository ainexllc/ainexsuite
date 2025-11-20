'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@ainexsuite/firebase';
import { Shield, Loader2, LogIn } from 'lucide-react';
import { AinexStudiosLogo, LayeredBackground } from '@ainexsuite/ui/components';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

function AdminLoginPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');
  const [error, setError] = useState<string | null>(null);
  const [signInLoading, setSignInLoading] = useState(false);
  const [isAdminChecking, setIsAdminChecking] = useState(false);

  const isFromLogout = searchParams.get('from') === 'logout';

  useEffect(() => {
    if (authLoading) {
      setLoadingMessage('Checking authentication...');
      return;
    }

    if (user) {
      setIsAdminChecking(true);
      const checkAdminRole = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          if (userData?.role === 'admin') {
            setLoadingMessage('Welcome admin! Redirecting to dashboard…');
            const timer = setTimeout(() => {
              router.push('/');
            }, 800);
            return () => clearTimeout(timer);
          } else {
            setError('Access Denied: Not an admin.');
            setLoadingMessage('');
            void auth.signOut(); // Force sign out non-admin users
          }
        } catch (err) {
          setError('Error verifying role. Please try again.');
          setLoadingMessage('');
          void auth.signOut();
        } finally {
          setIsAdminChecking(false);
        }
      };
      void checkAdminRole();
    } else {
      setLoadingMessage('');
    }
  }, [authLoading, user, isFromLogout, router]);

  const handleGoogleSignIn = async () => {
    setSignInLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Auth state change will be handled by useEffect above
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed');
      }
    } finally {
      setSignInLoading(false);
    }
  };

  if (authLoading || (user && isAdminChecking)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-indigo-500/20 animate-pulse" />
            </div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-indigo-500" />
          </div>
          {loadingMessage && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{loadingMessage}</p>
              {user && isAdminChecking && (
                <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Verifying admin privileges
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center p-4">
      <LayeredBackground />
      
      <div className="relative z-10 w-full max-w-md bg-zinc-800/80 border border-white/10 rounded-2xl p-8 shadow-lg backdrop-blur text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <Shield className="h-8 w-8 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
        <p className="text-zinc-400 text-sm mb-6">
          This area is restricted. Sign in with an authorized Google account.
        </p>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={signInLoading}
          className="w-full rounded-lg bg-white/10 py-3 px-4 text-sm font-medium text-white transition-all hover:bg-white/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {signInLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogIn className="h-5 w-5" />
          )}
          <span>Sign In with Google</span>
        </button>
        
        <div className="mt-8 text-center">
          <AinexStudiosLogo align="center" size="sm" asLink={false} className="opacity-50 hover:opacity-80 transition-opacity" />
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
          </div>
        </div>
      }
    >
      <AdminLoginPageContent />
    </Suspense>
  );
}