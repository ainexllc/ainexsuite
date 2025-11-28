'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@ainexsuite/firebase';
import { Loader2, Command } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

function AdminLoginPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [signInLoading, setSignInLoading] = useState(false);
  const [isAdminChecking, setIsAdminChecking] = useState(false);

  const isFromLogout = searchParams.get('from') === 'logout';

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      setIsAdminChecking(true);
      setLoadingMessage('Verifying access...');
      
      const checkAdminRole = async () => {
        try {
          const isDevelopment = process.env.NODE_ENV === 'development';
          // Development bypass
          if (isDevelopment) {
            router.push('/');
            return;
          }

          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          if (userData?.role === 'admin') {
            router.push('/');
          } else {
            setError('Access denied. Admin privileges required.');
            setLoadingMessage('');
            await auth.signOut();
          }
        } catch (err) {
          setError('Verification failed. Please try again.');
          setLoadingMessage('');
          await auth.signOut();
        } finally {
          setIsAdminChecking(false);
        }
      };
      checkAdminRole();
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
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Sign in failed');
      }
    } finally {
      setSignInLoading(false);
    }
  };

  if (authLoading || (user && isAdminChecking)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-base p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-white text-black mb-6 shadow-xl shadow-white/10">
            <Command className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            AINEX Admin
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Sign in to access the control center
          </p>
        </div>

        <div className="glass-card p-8 rounded-xl border border-white/10 shadow-2xl">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={signInLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signInLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Protected by AINEX Identity
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-base" />}>
      <AdminLoginPageContent />
    </Suspense>
  );
}
