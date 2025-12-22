'use client';

import {
  X,
  Settings,
  LogOut,
  Zap,
  Moon,
  Sun,
  Monitor,
  Bell,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@ainexsuite/theme';
import { useSystemUpdates } from '../../hooks/use-system-updates';
import { clsx } from 'clsx';

export interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    subscriptionStatus?: string;
    subscriptionTier?: string;
    trialStartDate?: number;
  };
  onSignOut: () => void;
  onSettingsClick?: () => void;
  onActivityClick?: () => void;
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
}

function getRelativeTime(date: any) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function ProfileSidebar({
  isOpen,
  onClose,
  user,
  onSignOut,
  onSettingsClick,
  onThemeChange,
}: ProfileSidebarProps) {
  const { updates, loading: updatesLoading } = useSystemUpdates();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use next-themes as the source of truth for the UI
  // Fallback to user pref or system only if not mounted yet (rare but safe)
  // Use local state for instant feedback (Optimistic UI)
  // This prevents any "lag" waiting for context updates or storage writes
  const [optimisticTheme, setOptimisticTheme] = useState<string>('system');

  // Sync local state with global theme when it changes externally (or initializes)
  // Note: We don't include `user` in dependencies to avoid stale preferences overriding optimistic state
  useEffect(() => {
    if (mounted && theme) {
      setOptimisticTheme(theme);
    }
  }, [theme, mounted]);

  const activeTheme = optimisticTheme;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]';
      case 'improvement': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
      case 'fix': return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]';
      default: return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]';
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-[360px] bg-background/60 backdrop-blur-xl border-l border-border transition-transform duration-300 ease-out z-40 shadow-2xl overflow-hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 h-80 w-80 bg-purple-500/20 blur-3xl rounded-full pointer-events-none opacity-40" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 bg-blue-500/20 blur-3xl rounded-full pointer-events-none opacity-40" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Profile</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 transition hover:bg-foreground/10"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">

            {/* User Identity */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-foreground/5 shadow-xl">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName ?? user.email ?? 'User'}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-foreground">
                    {user.displayName
                      ? user.displayName
                        .split(' ')
                        .map((part) => part.charAt(0))
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                      : (user.email?.charAt(0).toUpperCase() ?? 'U')}
                  </div>
                )}
                {/* Status Indicator */}
                <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{user.displayName || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-muted-foreground border border-border">
                  <CreditCard className="h-3 w-3" />
                  <span className="capitalize">{user.subscriptionTier || 'Free'} Plan</span>
                </div>
              </div>
            </div>

            {/* AI Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Zap className="h-3 w-3" /> AI Credits
                </h4>
                <span className="text-xs text-muted-foreground">750 / 1000</span>
              </div>
              <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
                <div className="h-full w-[75%] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </div>
              <p className="text-xs text-muted-foreground">Resets in 12 days</p>
            </div>

            {/* Theme Selector */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h4>
              <div className="flex items-center gap-3 text-muted-foreground mb-2">
                {activeTheme === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : activeTheme === 'system' ? (
                  <Monitor className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">Theme</span>
              </div>
              <div className="flex gap-1 p-1 bg-foreground/10 rounded-xl">
                {(['light', 'dark', 'system'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      // Optimistic interface update - instant feedback
                      setOptimisticTheme(mode);

                      // Actual theme update
                      setTheme(mode);

                      // Also persist to backend if handler provided (legacy, now handled by hook)
                      onThemeChange?.(mode);
                    }}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                      activeTheme === mode
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                    aria-label={`Set ${mode} theme`}
                  >
                    {mode === 'light' && <Sun className="h-3.5 w-3.5" />}
                    {mode === 'dark' && <Moon className="h-3.5 w-3.5" />}
                    {mode === 'system' && <Monitor className="h-3.5 w-3.5" />}
                    <span className="capitalize">{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Settings */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Settings</h4>
              <div className="space-y-1">
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-foreground/5 transition-colors group">
                  <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm font-medium">Focus Mode</span>
                  </div>
                  <div className="h-5 w-9 rounded-full bg-foreground/20 p-1 flex justify-start">
                    <div className="h-3 w-3 rounded-full bg-foreground/50" />
                  </div>
                </button>
              </div>
            </div>

            {/* Latest Updates */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> What&apos;s New
              </h4>
              <div className="space-y-1">
                {updatesLoading ? (
                  <p className="text-xs text-muted-foreground px-2">Loading updates...</p>
                ) : updates.length > 0 ? (
                  updates.map((update) => (
                    <div
                      key={update.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer group"
                    >
                      <div className={`mt-1.5 h-1.5 w-1.5 rounded-full group-hover:scale-150 transition-transform ${getTypeColor(update.type)}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">{update.title}</p>
                        <p className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors line-clamp-1">{update.description}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">{getRelativeTime(update.date)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground px-2">No recent updates</p>
                )}
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border space-y-2 bg-background/20">
            <button
              onClick={() => {
                onClose();
                onSettingsClick?.();
              }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground border border-transparent hover:border-border"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>

            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
