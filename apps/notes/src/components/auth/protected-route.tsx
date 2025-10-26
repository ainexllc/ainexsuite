"use client";

import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "@ainexsuite/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
  fallbackAction?: () => void;
};

export function ProtectedRoute({
  children,
  fallbackAction,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Redirect to Main app for login
  const handleFallback = fallbackAction ?? (() => {
    const isDev = process.env.NODE_ENV === 'development';
    const mainUrl = isDev ? 'http://localhost:3000' : 'https://www.ainexsuite.com';
    window.location.href = `${mainUrl}?returnTo=${encodeURIComponent(window.location.href)}`;
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="icon-button h-12 w-12 animate-spin bg-surface-muted text-accent-500">
          <Loader2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted">Preparing your workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <div className="surface-card max-w-md p-10 text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-600">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold text-ink-800">
            Sign in to see your notes
          </h2>
          <p className="mt-3 text-sm text-muted">
            Your workspace syncs in real-time across devices. Connect your account to start capturing ideas.
          </p>
          <button
            type="button"
            onClick={handleFallback}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-2 text-sm font-medium text-ink-50 shadow-sm transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500"
          >
            <LogIn className="h-4 w-4" />
            Continue
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
