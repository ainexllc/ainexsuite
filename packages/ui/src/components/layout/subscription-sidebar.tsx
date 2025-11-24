'use client';

import { X, Clock, Crown, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ProfileSection } from '../profile/profile-section';
import { UsageMeter } from '../profile/usage-meter';
import { ConnectedApps, type App } from '../profile/connected-apps';
import { ActivityStats, type ActivityStat } from '../profile/activity-stats';
import { ThemeToggle } from '../profile/theme-toggle';
import { HelpSupport } from '../profile/help-support';
import { WhatsNew } from '../profile/whats-new';

export interface SubscriptionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    subscriptionStatus?: string;
    subscriptionTier?: string;
    trialStartDate?: number;
  };
  // Optional props for new features
  queriesUsed?: number;
  queriesLimit?: number;
  apps?: App[];
  accessibleApps?: string[];
  activityStats?: ActivityStat[];
  weeklyData?: number[];
}

export function SubscriptionSidebar({
  isOpen,
  onClose,
  onSignOut,
  user,
  queriesUsed = 45,
  queriesLimit = 200,
  apps = [],
  accessibleApps = [],
  activityStats = [],
  weeklyData,
}: SubscriptionSidebarProps) {
  // Calculate trial days remaining
  const getRemainingTrialDays = () => {
    if (!user.trialStartDate || user.subscriptionStatus !== 'trial') return null;
    const trialEndDate = new Date(user.trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 30);
    const now = new Date();
    const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 / 60 / 60 / 24));
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
        className={`fixed right-0 top-0 h-full w-[360px] bg-black/20 backdrop-blur-3xl border-l border-white/10 transition-transform duration-300 ease-out z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
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
        <div className="space-y-6 pb-24">
          {/* Profile Section */}
          <ProfileSection user={user} onClose={onClose} />

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Trial Status Card */}
          {isTrialActive && (
            <div className="px-4">
              <div className="rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/30 p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-amber-300">Free Trial</h3>
                    <p className="text-xs text-amber-200/70 mt-1">
                      {trialDaysRemaining === 1
                        ? 'Last day of your trial'
                        : `${trialDaysRemaining} days remaining`}
                    </p>
                    <Link
                      href="/plans"
                      onClick={onClose}
                      className="mt-3 inline-block text-xs font-medium text-amber-300 hover:text-amber-200 transition"
                    >
                      Upgrade to Pro →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Subscription Card */}
          {user.subscriptionStatus && user.subscriptionStatus !== 'trial' && (
            <div className="px-4">
              <div className="rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 p-4">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-emerald-300 capitalize">
                      {user.subscriptionTier} Plan
                    </h3>
                    <p className="text-xs text-emerald-200/70 mt-1 capitalize">
                      {user.subscriptionStatus === 'active' ? 'Active subscription' : user.subscriptionStatus}
                    </p>
                    <Link
                      href="/billing"
                      onClick={onClose}
                      className="mt-3 inline-block text-xs font-medium text-emerald-300 hover:text-emerald-200 transition"
                    >
                      Manage subscription →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Usage Meter */}
          <div className="px-4">
            <UsageMeter
              queriesUsed={queriesUsed}
              queriesLimit={queriesLimit}
              tierName={user.subscriptionTier}
            />
          </div>

          {/* Theme Toggle */}
          <div className="px-4">
            <ThemeToggle />
          </div>

          {/* Connected Apps */}
          {apps.length > 0 && (
            <div className="px-4">
              <ConnectedApps
                apps={apps}
                accessibleApps={accessibleApps}
                onClose={onClose}
              />
            </div>
          )}

          {/* Activity Stats */}
          {activityStats.length > 0 && (
            <div className="px-4">
              <ActivityStats
                stats={activityStats}
                weeklyData={weeklyData}
              />
            </div>
          )}

          {/* What's New */}
          <div className="px-4">
            <WhatsNew />
          </div>

          {/* Help & Support */}
          <div className="px-4">
            <HelpSupport onClose={onClose} />
          </div>
        </div>

        {/* Footer - Sign Out Button */}
        <div className="sticky bottom-0 p-4 border-t border-white/10 bg-black/40 backdrop-blur-xl">
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
