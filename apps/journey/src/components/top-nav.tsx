'use client';

import { useAuth } from '@ainexsuite/auth';
import { BookOpen, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export function TopNav() {
  const { user, signOut } = useAuth();

  return (
    <nav className="h-16 surface-elevated border-b border-surface-hover flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-brand font-semibold text-lg">Journal</h1>
          <p className="text-xs text-ink-600">Daily reflections</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="https://www.ainexsuite.com/workspace"
          className="flex items-center gap-2 px-4 py-2 surface-card hover:surface-hover rounded-lg transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-sm">Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">{user?.displayName || user?.email}</div>
            <div className="text-xs text-ink-600">Journal</div>
          </div>

          <button
            onClick={signOut}
            className="p-2 surface-card hover:surface-hover rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
