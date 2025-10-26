'use client';

import { useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import type { User } from '@ainexsuite/types';
import { LogOut, Settings, User as UserIcon, ChevronDown } from 'lucide-react';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-surface-muted transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white font-semibold">
          {user.displayName?.[0]?.toUpperCase() || 'U'}
        </div>

        {/* User Info */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-ink-900">
            {user.displayName || 'User'}
          </p>
          <p className="text-xs text-ink-600">
            {user.email}
          </p>
        </div>

        <ChevronDown className={`h-4 w-4 text-ink-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 surface-card rounded-xl p-2 shadow-xl z-20">
            {/* User Info (mobile) */}
            <div className="sm:hidden px-3 py-2 mb-2 border-b border-outline-base">
              <p className="text-sm font-medium text-ink-900">
                {user.displayName || 'User'}
              </p>
              <p className="text-xs text-ink-600">
                {user.email}
              </p>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to settings (Phase 5)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors text-ink-900"
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to profile (Phase 5)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors text-ink-900"
            >
              <UserIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Profile</span>
            </button>

            <div className="my-2 border-t border-outline-base" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-500"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
