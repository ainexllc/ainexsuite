'use client';

import { useAuth } from '@ainexsuite/auth';
import { GraduationCap, LogOut, Target, Award, TrendingUp } from 'lucide-react';

interface TopNavProps {
  viewMode: 'goals' | 'skills' | 'dashboard';
  onViewModeChange: (mode: 'goals' | 'skills' | 'dashboard') => void;
}

export function TopNav({ viewMode, onViewModeChange }: TopNavProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 surface-elevated border-b border-surface-hover">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-display font-bold">Grow</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewModeChange('goals')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'goals'
                  ? 'bg-accent-500 text-white'
                  : 'text-ink-700 hover:bg-surface-hover'
              }`}
            >
              <Target className="h-4 w-4" />
              Goals
            </button>

            <button
              onClick={() => onViewModeChange('skills')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'skills'
                  ? 'bg-accent-500 text-white'
                  : 'text-ink-700 hover:bg-surface-hover'
              }`}
            >
              <Award className="h-4 w-4" />
              Skills
            </button>

            <button
              onClick={() => onViewModeChange('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'dashboard'
                  ? 'bg-accent-500 text-white'
                  : 'text-ink-700 hover:bg-surface-hover'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Progress
            </button>
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
