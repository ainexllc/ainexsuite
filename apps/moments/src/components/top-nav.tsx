'use client';

import { useAuth } from '@ainexsuite/auth';
import { Camera, LogOut, Tag, X } from 'lucide-react';

interface TopNavProps {
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  tags: string[];
}

export function TopNav({ selectedTag, onSelectTag, tags }: TopNavProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 surface-elevated border-b border-surface-hover">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-display font-bold">Moments</h1>
          </div>

          <div className="flex items-center gap-4">
            {tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-ink-600" />
                <select
                  value={selectedTag || ''}
                  onChange={(e) => onSelectTag(e.target.value || null)}
                  className="px-3 py-1 surface-card rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none text-sm"
                >
                  <option value="">All Tags</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                {selectedTag && (
                  <button
                    onClick={() => onSelectTag(null)}
                    className="p-1 hover:bg-surface-hover rounded"
                  >
                    <X className="h-4 w-4 text-ink-600" />
                  </button>
                )}
              </div>
            )}

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
      </div>
    </nav>
  );
}
