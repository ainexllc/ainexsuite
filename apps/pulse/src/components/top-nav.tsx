'use client';

import { useAuth } from '@ainexsuite/auth';
import { Activity, LogOut } from 'lucide-react';

export function TopNav() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 surface-elevated border-b border-surface-hover">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-display font-bold">Pulse</h1>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <div className="text-ink-900">{user.displayName}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5 text-ink-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
