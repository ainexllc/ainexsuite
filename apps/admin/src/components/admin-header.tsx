'use client';

import { useState } from 'react';
import { Search, Bell, Settings, Sun, Moon, ChevronDown, Command, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@ainexsuite/auth';
import { AdminSidebarToggle } from './admin-sidebar';

interface AdminHeaderProps {
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  };
  onSidebarToggle: () => void;
  notificationCount?: number;
}

export function AdminHeader({ user, onSidebarToggle, notificationCount = 0 }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    const isDev = process.env.NODE_ENV === 'development';
    window.location.href = isDev ? 'http://localhost:3000' : 'https://www.ainexspace.com';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-[#0a0a0a] border-b border-zinc-200 dark:border-[#27272a]">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <AdminSidebarToggle onClick={onSidebarToggle} />

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-[#18181b] rounded-lg w-64 lg:w-80 border border-zinc-200 dark:border-[#27272a]">
          <Search className="w-4 h-4 text-zinc-400 dark:text-[#71717a]" />
          <input
            type="text"
            placeholder="Search or type command..."
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#71717a] outline-none"
          />
          <kbd className="hidden lg:flex items-center gap-1 px-2 py-0.5 bg-zinc-200 dark:bg-[#27272a] rounded text-xs text-zinc-500 dark:text-[#a1a1aa]">
            <Command className="w-3 h-3" />K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-zinc-500 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-zinc-500 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button className="p-2 text-zinc-500 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-[#27272a] flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-zinc-700 dark:text-white">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'A'}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate max-w-[120px]">
                {user.displayName || 'Admin'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-[#a1a1aa] truncate max-w-[120px]">
                {user.email || 'admin@ainex.com'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-[#a1a1aa]" />
          </button>

          {/* Dropdown */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white dark:bg-[#18181b] rounded-lg shadow-xl border border-zinc-200 dark:border-[#27272a] z-50">
                <a
                  href="/workspace/settings"
                  className="block px-4 py-2 text-sm text-zinc-600 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5"
                >
                  Settings
                </a>
                <hr className="my-2 border-zinc-200 dark:border-[#27272a]" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-zinc-50 dark:hover:bg-white/5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
