'use client';

import { X, Home, Clock, Crown } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

export interface AppNavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  apps: Array<{
    name: string;
    slug: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }>;
  user?: {
    subscriptionStatus?: string;
    subscriptionTier?: string;
    trialStartDate?: number;
  };
}

export function AppNavigationSidebar({
  isOpen,
  onClose,
  apps,
  user,
}: AppNavigationSidebarProps) {
  // Calculate trial days remaining
  const getRemainingTrialDays = () => {
    if (!user?.trialStartDate || user?.subscriptionStatus !== 'trial') return null;
    const trialEndDate = new Date(user.trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 30);
    const now = new Date();
    const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  };

  const trialDaysRemaining = getRemainingTrialDays();
  const isTrialActive = user?.subscriptionStatus === 'trial' && trialDaysRemaining !== null && trialDaysRemaining > 0;
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
        className={`fixed left-0 top-0 h-full w-[280px] bg-surface-elevated/95 backdrop-blur-2xl border-r border-outline-subtle/60 transition-transform duration-300 ease-out z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-white/10 bg-surface-elevated/95">
          <h2 className="text-lg font-semibold text-white">Apps</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full p-3">
          <div className="space-y-2 flex-1">
            {/* Back to Dashboard */}
            <Link
              href="/workspace"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              <span>Suite Dashboard</span>
            </Link>

            {/* Divider */}
            <div className="my-2 border-t border-white/10" />

            {/* Apps List */}
            <div className="space-y-1">
              {apps.map((app) => {
                const IconComponent = app.icon;
                return (
                  <a
                    key={app.slug}
                    href={app.url}
                    onClick={onClose}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white group"
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="flex-1">{app.name}</span>
                    <span className="text-xs text-white/40 group-hover:text-white/60 transition">
                      →
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Trial/Subscription Info at Bottom */}
          <div className="border-t border-white/10 pt-3 mt-3">
            {isTrialActive && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-300">Free Trial</span>
                </div>
                <p className="text-xs text-amber-200/70">
                  {trialDaysRemaining === 1
                    ? 'Last day of your trial'
                    : `${trialDaysRemaining} days remaining`}
                </p>
                <Link
                  href="/plans"
                  onClick={onClose}
                  className="mt-2 inline-block text-xs font-medium text-amber-300 hover:text-amber-200 transition"
                >
                  Upgrade to Pro →
                </Link>
              </div>
            )}

            {user?.subscriptionStatus && user?.subscriptionStatus !== 'trial' && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300 capitalize">
                    {user.subscriptionTier} Plan
                  </span>
                </div>
                <p className="text-xs text-emerald-200/70 capitalize">
                  {user.subscriptionStatus === 'active' ? 'Active subscription' : user.subscriptionStatus}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
