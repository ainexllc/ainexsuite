'use client';

import { X, Clock, Crown, Zap } from 'lucide-react';
import Link from 'next/link';

export interface SubscriptionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    displayName?: string | null;
    subscriptionStatus?: string;
    subscriptionTier?: string;
    trialStartDate?: number;
  };
}

export function SubscriptionSidebar({
  isOpen,
  onClose,
  user,
}: SubscriptionSidebarProps) {
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
        className={`fixed left-0 top-0 h-full w-[320px] bg-surface-elevated/95 backdrop-blur-2xl border-r border-outline-subtle/60 transition-transform duration-300 ease-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Account</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Trial Status Card */}
          {isTrialActive && (
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
          )}

          {/* Active Subscription Card */}
          {user.subscriptionStatus && user.subscriptionStatus !== 'trial' && (
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
                  <button
                    onClick={onClose}
                    className="mt-3 inline-block text-xs font-medium text-emerald-300 hover:text-emerald-200 transition"
                  >
                    Manage subscription →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Available Features
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-white/70">
                  {isTrialActive
                    ? 'All apps included'
                    : user.subscriptionTier === 'single-app'
                    ? '1 app of your choice'
                    : user.subscriptionTier === 'three-apps'
                    ? '3 apps of your choice'
                    : 'All 8 apps'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-purple-400 flex-shrink-0" />
                <span className="text-sm text-white/70">
                  {isTrialActive
                    ? '200 AI queries/month'
                    : user.subscriptionTier === 'single-app' || user.subscriptionTier === 'pro'
                    ? user.subscriptionTier === 'pro'
                      ? '2,000 queries/month'
                      : '200 queries/month'
                    : user.subscriptionTier === 'three-apps'
                    ? '500 queries/month'
                    : '10,000+ queries/month'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
