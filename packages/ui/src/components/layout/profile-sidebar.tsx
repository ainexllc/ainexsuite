'use client';

import { X, Clock, Crown, Settings, LogOut, Activity } from 'lucide-react';
import Image from 'next/image';

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
}

export function ProfileSidebar({
  isOpen,
  onClose,
  user,
  onSignOut,
  onSettingsClick,
  onActivityClick,
}: ProfileSidebarProps) {
  // Calculate trial days remaining
  const getRemainingTrialDays = () => {
    if (!user.trialStartDate || user.subscriptionStatus !== 'trial') return null;
    const trialEndDate = new Date(user.trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 30);
    const now = new Date();
    const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  };

  const trialDaysRemaining = getRemainingTrialDays();
  const isTrialActive = user.subscriptionStatus === 'trial' && trialDaysRemaining !== null && trialDaysRemaining > 0;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-[320px] bg-black/60 backdrop-blur-xl border-l border-white/10 transition-transform duration-300 ease-out z-40 shadow-2xl overflow-hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 h-64 w-64 bg-purple-500/20 blur-3xl rounded-full pointer-events-none opacity-50" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none opacity-50" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/10 bg-transparent">
          <h2 className="text-lg font-semibold text-white">Profile</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 p-4 space-y-6">

          {/* User Info */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-white/10">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName ?? user.email ?? 'User'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-purple-600 flex items-center justify-center text-xl font-bold text-white">
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
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">{user.displayName || 'User'}</h3>
              <p className="text-sm text-white/50">{user.email}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1">
            {onActivityClick && (
              <button
                onClick={() => {
                  onClose();
                  onActivityClick();
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <Activity className="h-4 w-4" />
                Activity
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onSettingsClick?.();
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>

            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
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
