"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@ainexsuite/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect non-logged-in users to public homepage
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

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
    // Show loading while redirecting
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="icon-button h-12 w-12 animate-spin bg-surface-muted text-accent-500">
          <Loader2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted">Redirecting to homepage…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
