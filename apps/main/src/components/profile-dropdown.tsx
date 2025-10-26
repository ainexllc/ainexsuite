'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, RefreshCw, LogOut, Activity as ActivityIcon } from 'lucide-react';
import { clsx } from 'clsx';
import Image from 'next/image';
import { useAuth } from '@ainexsuite/auth';
import type { User } from '@ainexsuite/types';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenActivity: () => void;
  onRefresh: () => void;
  user: User;
}

export function ProfileDropdown({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenActivity,
  onRefresh,
  user,
}: ProfileDropdownProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSettings = () => {
    onOpenSettings();
    onClose();
  };

  const handleActivity = () => {
    onOpenActivity();
    onClose();
  };

  const handleRefresh = () => {
    onRefresh();
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
    router.push('/');
  };

  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div
      ref={dropdownRef}
      className={clsx(
        'absolute right-0 top-full mt-2 w-64 rounded-2xl bg-surface-elevated/95 backdrop-blur-2xl border border-outline-subtle/60 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50'
      )}
    >
      {/* User info */}
      <div className="px-3 py-3 border-b border-outline-subtle/40">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || user.email || 'User'}
              width={40}
              height={40}
              className="rounded-full object-cover"
              sizes="40px"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-accent-500 text-white grid place-items-center font-semibold text-sm">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {user.displayName && (
              <p className="font-semibold text-sm text-ink-900 truncate">
                {user.displayName}
              </p>
            )}
            <p className="text-xs text-ink-600 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1 space-y-0.5">
        <button
          type="button"
          onClick={handleSettings}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-surface-muted hover:text-ink-900 transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={handleActivity}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-surface-muted hover:text-ink-900 transition-colors"
        >
          <ActivityIcon className="h-4 w-4" />
          <span>Activity</span>
        </button>

        <button
          type="button"
          onClick={handleRefresh}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-surface-muted hover:text-ink-900 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Sign out */}
      <div className="border-t border-outline-subtle/40 pt-1 pb-1 mt-1">
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
