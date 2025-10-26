'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@ainexsuite/firebase';
import type { SearchableApp } from '@ainexsuite/types';
import { clsx } from 'clsx';

interface AuthBoxProps {
  appId: SearchableApp | 'suite';
  appName: string;
  onAuthSuccess?: (uid: string) => void;
  logoContent?: React.ReactNode;
  accentColor?: string;
}

interface ExistingAccount {
  email: string;
  displayName: string;
  photoURL?: string;
  primaryApp: SearchableApp | 'suite';
  hasAppAccess: boolean;
}

export function AuthBox({
  appId,
  appName,
  onAuthSuccess,
  logoContent,
  accentColor = '#f97316',
}: AuthBoxProps) {
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingAccount, setExistingAccount] = useState<ExistingAccount | null>(null);
  const [showExistingAccountModal, setShowExistingAccountModal] = useState(false);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const detectExistingAccount = async (emailToCheck: string): Promise<ExistingAccount | null> => {
    try {
      const response = await fetch('/api/auth/detect-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.account || null;
      }
      return null;
    } catch (error) {
      console.error('Account detection error:', error);
      return null;
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authTab === 'signin') {
        // Sign in with email/password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess?.(userCredential.user.uid);
      } else {
        // Sign up - check for existing account first
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const existing = await detectExistingAccount(email);

        if (existing) {
          // Account exists - show modal
          setExistingAccount(existing);
          setShowExistingAccountModal(true);
          setLoading(false);
          return;
        }

        // Create new account for this app
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onAuthSuccess?.(userCredential.user.uid);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();

      if (authTab === 'signup') {
        // Check for existing account before signing up with Google
        // For Google auth, we'll check after getting the user info
        const result = await signInWithPopup(auth, provider);
        const googleEmail = result.user.email;

        if (googleEmail) {
          const existing = await detectExistingAccount(googleEmail);

          if (existing) {
            setExistingAccount(existing);
            setShowExistingAccountModal(true);
            // Note: User is now signed in to Firebase, but we need to handle the app permission
            setLoading(false);
            return;
          }
        }
      } else {
        // Sign in with Google
        await signInWithPopup(auth, provider);
      }

      const user = auth.currentUser;
      if (user) {
        onAuthSuccess?.(user.uid);
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseExistingAccount = async () => {
    if (!existingAccount) return;

    try {
      // Request permission to use this app
      const response = await fetch('/api/auth/request-app-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          userEmail: existingAccount.email,
        }),
      });

      if (response.ok) {
        const user = auth.currentUser;
        if (user) {
          onAuthSuccess?.(user.uid);
        }
      } else {
        setError('Failed to request app permission');
      }
    } catch (error) {
      setError('Error requesting app permission');
    } finally {
      setShowExistingAccountModal(false);
    }
  };

  const handleCreateNewAccount = () => {
    setShowExistingAccountModal(false);
    clearForm();
    setAuthTab('signup');
    // Sign out the current Google sign-in user if applicable
    if (auth.currentUser) {
      auth.signOut();
    }
  };

  return (
    <>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg backdrop-blur">
        {logoContent && (
          <div className="mb-8 flex justify-center">
            {logoContent}
          </div>
        )}

        <div className="mb-6 flex gap-2 rounded-lg bg-zinc-700/50 p-1">
          <button
            onClick={() => {
              setAuthTab('signin');
              clearForm();
            }}
            className={clsx(
              'flex-1 rounded-md py-2 px-3 text-sm font-medium transition-all',
              authTab === 'signin'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthTab('signup');
              clearForm();
            }}
            className={clsx(
              'flex-1 rounded-md py-2 px-3 text-sm font-medium transition-all',
              authTab === 'signup'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
            )}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all"
              placeholder="you@example.com"
              disabled={loading}
              required
              style={{
                WebkitBoxShadow: '0 0 0 1000px transparent inset',
                WebkitTextFillColor: 'white',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all"
              placeholder="••••••••"
              disabled={loading}
              required
              style={{
                WebkitBoxShadow: '0 0 0 1000px transparent inset',
                WebkitTextFillColor: 'white',
              }}
            />
          </div>

          {authTab === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all"
                placeholder="••••••••"
                disabled={loading}
                required
                style={{
                  WebkitBoxShadow: '0 0 0 1000px transparent inset',
                  WebkitTextFillColor: 'white',
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: accentColor }}
            className="w-full rounded-lg py-2.5 px-4 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Loading...' : authTab === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/50">Or continue with</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 px-4 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
          </svg>
          Google
        </button>
      </div>

      {/* Existing Account Modal */}
      {showExistingAccountModal && existingAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-2xl border border-white/10 p-8 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-2">
              Account Found
            </h2>
            <p className="text-white/70 mb-6">
              We found an existing account for <span className="font-medium text-white">{existingAccount.email}</span>.
            </p>

            <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
              <p className="text-sm text-white/60 mb-2">Primary App</p>
              <p className="text-white font-medium capitalize">{existingAccount.primaryApp}</p>
            </div>

            <p className="text-sm text-white/70 mb-6">
              Would you like to use your existing account to access {appName}, or create a new account?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCreateNewAccount}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2.5 px-4 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                Create New
              </button>
              <button
                onClick={handleUseExistingAccount}
                style={{ backgroundColor: accentColor }}
                className="flex-1 rounded-lg py-2.5 px-4 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                Use Existing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
