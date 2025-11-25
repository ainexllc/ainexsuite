/**
 * Paywall Component
 * Displays when user needs Suite access to continue using multiple apps
 */

'use client';

import React from 'react';
import { Loader2, Sparkles, Check } from 'lucide-react';

interface PaywallProps {
  message: string;
  daysRemaining?: number;
  onUpgrade?: () => void;
}

export function Paywall({ message, daysRemaining, onUpgrade }: PaywallProps) {
  
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default behavior: redirect to main suite
      const isDev = process.env.NODE_ENV === 'development';
      const suiteUrl = isDev ? 'http://localhost:3010' : 'https://www.ainexsuite.com';
      window.location.href = suiteUrl;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base p-4">
      <div className="max-w-md w-full bg-surface-card rounded-2xl shadow-xl border border-outline-base p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-500/20 rounded-full blur-xl" />
            <div className="relative bg-accent-500 rounded-full p-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-ink-900 text-center mb-2">
          Unlock Full Suite Access
        </h2>

        {/* Message */}
        <p className="text-ink-600 text-center mb-6">
          {message}
        </p>

        {/* Details */}
        <div className="bg-surface-muted rounded-lg p-4 mb-6">
          <p className="text-sm text-ink-700 mb-3">
            Get access to all 8 productivity apps:
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {['Notes', 'Journal', 'Tasks', 'Health', 'Moments', 'Grow', 'Pulse', 'Fit'].map((app) => (
              <div key={app} className="flex items-center gap-2 text-ink-600">
                <Check className="h-4 w-4 text-accent-500 flex-shrink-0" />
                <span>{app}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-accent-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink-900">Single Sign-On</p>
              <p className="text-xs text-ink-600">One login across all apps</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-accent-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink-900">Seamless Integration</p>
              <p className="text-xs text-ink-600">Switch between apps instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-accent-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink-900">Unified Dashboard</p>
              <p className="text-xs text-ink-600">Track your activity across all apps</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleUpgrade}
          className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Upgrade to Suite
        </button>

        {/* Trial Notice */}
        {daysRemaining !== undefined && daysRemaining > 0 && (
          <p className="text-xs text-ink-500 text-center mt-4">
            {daysRemaining} days remaining in your trial
          </p>
        )}
      </div>
    </div>
  );
}

interface LoadingPaywallProps {
  message?: string;
}

export function LoadingPaywall({ message = 'Loading...' }: LoadingPaywallProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500 mx-auto mb-4" />
        <p className="text-ink-600">{message}</p>
      </div>
    </div>
  );
}

