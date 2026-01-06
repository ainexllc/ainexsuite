'use client';

import { useState } from 'react';
import { useAuth } from './context';

/**
 * AppActivationModal Component
 *
 * Shows when user accesses an app not in their appsEligible list.
 * Prompts for explicit consent before adding app to their account.
 *
 * Features:
 * - Shows user avatar/email for recognition
 * - Primary CTA: "Use my AiNex account"
 * - Secondary: "Use a different email"
 * - Handles redirect for multi-app users
 * - Preserves returnTo for deep links
 *
 * Usage:
 * <AppActivationModal
 *   appName="notes"
 *   appDisplayName="Notes"
 *   onActivated={() => window.location.reload()}
 * />
 */

type AppActivationModalProps = {
  appName: string;
  appDisplayName: string;
  onActivated?: () => void;
  onDifferentEmail?: () => void;
};

export function AppActivationModal({
  appName,
  appDisplayName,
  onActivated,
  onDifferentEmail,
}: AppActivationModalProps) {
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

      // Handle redirect for multi-app users
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
      setError(err instanceof Error ? err.message : 'Failed to activate app');
      setActivating(false);
    }
  };

  const handleDifferentEmail = () => {
    if (onDifferentEmail) {
      onDifferentEmail();
    } else {
      // Default: redirect to signup
      const isDev = process.env.NODE_ENV === 'development';
      const loginUrl = isDev
        ? `http://localhost:3000/signup?returnTo=${encodeURIComponent(window.location.href)}`
        : `https://www.ainexspace.com/signup?returnTo=${encodeURIComponent(window.location.href)}`;
      window.location.href = loginUrl;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-2xl shadow-2xl border border-border max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Activate {appDisplayName}?
          </h2>
          <p className="text-muted-foreground">
            Use your AiNex account to access {appDisplayName}
          </p>
        </div>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg mb-6">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-foreground font-semibold">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">
                {user.displayName || 'User'}
              </div>
              <div className="text-sm text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleActivate}
            disabled={activating}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {activating ? 'Activating...' : 'Use my account'}
          </button>
          <button
            onClick={handleDifferentEmail}
            disabled={activating}
            className="w-full bg-transparent hover:bg-muted text-foreground font-medium py-3 px-6 rounded-lg transition-colors border border-border"
          >
            Use a different email
          </button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          By activating, you consent to using this app with your AiNex account
        </p>
      </div>
    </div>
  );
}
