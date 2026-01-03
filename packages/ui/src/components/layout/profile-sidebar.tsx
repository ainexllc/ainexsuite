'use client';

import {
  X,
  Settings,
  LogOut,
  Zap,
  Moon,
  Sun,
  Monitor,
  CreditCard,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@ainexsuite/theme';
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

export function ProfileSidebar({
  isOpen,
  onClose,
  user,
  onSignOut,
  onSettingsClick,
  onThemeChange,
}: ProfileSidebarProps) {
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
          {/* Profile Banner Header */}
          <div className="relative border-b border-border overflow-hidden">
            {/* Close Button - Always on top */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black/30 backdrop-blur-sm transition hover:bg-black/50"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4 text-white" />
            </button>

            {/* Banner Background */}
            {user.photoURL ? (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${user.photoURL})` }}
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
            )}

            {/* Profile Content - min-height for 16:9 aspect ratio (360px / 16 * 9 ≈ 202px) */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[202px] px-6">
              <h3 className="text-xl font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {user.displayName || 'User'}
              </h3>
              <p className="text-sm text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-1">
                {user.email}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white border border-white/20">
                <CreditCard className="h-3 w-3" />
                <span className="capitalize">{user.subscriptionTier || 'Free'} Plan</span>
              </div>
              {/* Status Indicator */}
              <div className="absolute bottom-3 right-6 flex items-center gap-1.5 text-xs text-white/70">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                <span>Online</span>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">

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
