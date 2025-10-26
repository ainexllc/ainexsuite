'use client';

/**
 * App Activation Box Component
 *
 * Displayed on public homepages when a signed-in user visits an app they haven't activated.
 * Styled to match the login box design (orange-bordered card).
 *
 * Features:
 * - Shows user avatar/email for recognition
 * - Primary CTA: "Use my account" (activates app)
 * - Secondary: "Use a different email" (signs out and shows login)
 * - Handles activation API call and redirect logic
 * - Loading and error states
 *
 * Usage:
 * <AppActivationBox
 *   appName="notes"
 *   appDisplayName="Notes"
 *   onActivated={() => window.location.reload()}
 *   onDifferentEmail={async () => {
 *     await signOut();
 *     setShowActivation(false);
 *   }}
 * />
 */

import { useState } from 'react';
import { useAuth } from './context';

type AppActivationBoxProps = {
  appName: string;
  appDisplayName: string;
  onActivated?: () => void;
  onDifferentEmail?: () => void;
};

export function AppActivationBox({
  appName,
  appDisplayName,
  onActivated,
  onDifferentEmail,
}: AppActivationBoxProps) {
  const { user } = useAuth();
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async () => {
    setActivating(true);
    setError(null);

    try {
      const response = await fetch('/api/apps/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: appName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Activation failed');
      }

      const data = await response.json();

      // Handle redirect for multi-app users (2+ apps)
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }

      // Success - reload or callback
      if (onActivated) {
        onActivated();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Activation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to activate app');
      setActivating(false);
    }
  };

  const handleDifferentEmail = () => {
    if (onDifferentEmail) {
      onDifferentEmail();
    } else {
      // Default: redirect to main signup
      const isDev = process.env.NODE_ENV === 'development';
      const loginUrl = isDev
        ? `http://localhost:3000/signup?returnTo=${encodeURIComponent(window.location.href)}`
        : `https://www.ainexsuite.com/signup?returnTo=${encodeURIComponent(window.location.href)}`;
      window.location.href = loginUrl;
    }
  };

  return (
    <div id="login" className="relative mb-[75px]">
      {/* Glow effect */}
      <div className="absolute inset-0 -translate-y-6 rounded-3xl bg-gradient-to-tr from-[#f97316]/15 via-transparent to-[#6366f1]/20 blur-2xl" />

      {/* Card */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-[#f97316]/20 bg-[#050505]/90 p-8 text-white shadow-[0_25px_80px_-25px_rgba(249,115,22,0.35)] backdrop-blur-xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f97316]">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              SSO Account
            </span>
            <h2 className="text-3xl font-semibold text-white">
              Activate {appDisplayName}?
            </h2>
            <p className="text-sm text-white/70">
              Use your AiNex account to access {appDisplayName}
            </p>
          </div>
          <svg className="mt-1 h-5 w-5 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* User Info */}
        {user && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f97316] text-white font-semibold">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">
                {user.displayName || 'User'}
              </div>
              <div className="text-sm text-white/60 truncate">{user.email}</div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleActivate}
            disabled={activating}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#f97316] text-white font-semibold hover:bg-[#ea6a0f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {activating ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Activating...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Use my account</span>
              </>
            )}
          </button>

          <button
            onClick={handleDifferentEmail}
            disabled={activating}
            className="w-full rounded-2xl border border-white/15 bg-transparent px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Use a different email
          </button>
        </div>

        {/* Info Text */}
        <p className="mt-4 text-xs text-white/50 text-center">
          By activating, you consent to using this app with your AiNex account
        </p>
      </div>
    </div>
  );
}
