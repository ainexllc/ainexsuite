'use client';

import { 
  X, 
  Settings, 
  LogOut, 
  Zap, 
  Moon, 
  Bell,
  CreditCard,
  Sparkles,
  ArrowRight
} from 'lucide-react';
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
}: ProfileSidebarProps) {
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
        className={`fixed right-0 top-0 h-full w-[360px] bg-black/60 backdrop-blur-xl border-l border-white/10 transition-transform duration-300 ease-out z-40 shadow-2xl overflow-hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 h-80 w-80 bg-purple-500/20 blur-3xl rounded-full pointer-events-none opacity-40" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 bg-blue-500/20 blur-3xl rounded-full pointer-events-none opacity-40" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Profile</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* User Identity */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white/5 shadow-xl">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName ?? user.email ?? 'User'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
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
                <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-black" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{user.displayName || 'User'}</h3>
                <p className="text-sm text-white/50">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/70 border border-white/5">
                  <CreditCard className="h-3 w-3" />
                  <span className="capitalize">{user.subscriptionTier || 'Free'} Plan</span>
                </div>
              </div>
            </div>

            {/* AI Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2">
                  <Zap className="h-3 w-3" /> AI Credits
                </h4>
                <span className="text-xs text-white/70">750 / 1000</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[75%] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </div>
              <p className="text-xs text-white/40">Resets in 12 days</p>
            </div>

            {/* Quick Settings */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Quick Settings</h4>
              <div className="space-y-1">
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3 text-white/70 group-hover:text-white">
                    <Moon className="h-4 w-4" />
                    <span className="text-sm font-medium">Dark Mode</span>
                  </div>
                  <div className="h-5 w-9 rounded-full bg-purple-600 p-1 flex justify-end">
                    <div className="h-3 w-3 rounded-full bg-white" />
                  </div>
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3 text-white/70 group-hover:text-white">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm font-medium">Focus Mode</span>
                  </div>
                  <div className="h-5 w-9 rounded-full bg-white/20 p-1 flex justify-start">
                    <div className="h-3 w-3 rounded-full bg-white/50" />
                  </div>
                </button>
              </div>
            </div>

            {/* Latest Updates */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> What's New
              </h4>
              <div className="space-y-1">
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Pulse Dashboard 2.0</p>
                    <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Custom widgets & drag-and-drop</p>
                  </div>
                  <span className="text-[10px] text-white/30 whitespace-nowrap mt-0.5">2d</span>
                </div>
                
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Smart Notes AI</p>
                    <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Auto-summaries and insights</p>
                  </div>
                  <span className="text-[10px] text-white/30 whitespace-nowrap mt-0.5">5d</span>
                </div>

                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Global Search</p>
                    <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Find anything across apps</p>
                  </div>
                  <span className="text-[10px] text-white/30 whitespace-nowrap mt-0.5">1w</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 space-y-2 bg-black/20">
            <button
              onClick={() => {
                onClose();
                onSettingsClick?.();
              }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10"
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