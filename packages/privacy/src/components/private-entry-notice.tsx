'use client';

import { Lock, Shield, ArrowRight } from 'lucide-react';
import { usePrivacy } from '../providers/privacy-provider';
import type { PrivateEntryNoticeProps } from '../types';

export function PrivateEntryNotice({
  isPrivate,
  settingsLink = '/workspace/settings',
  accentColor = 'var(--color-primary, #f97316)',
}: PrivateEntryNoticeProps) {
  const { hasPasscode } = usePrivacy();

  if (!isPrivate) return null;

  if (!hasPasscode) {
    return (
      <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 text-amber-400" />
          <div className="flex-1">
            <h4 className="mb-1 font-medium text-white">Private Entry</h4>
            <p className="mb-2 text-sm text-white/70">
              This entry is marked as private. Your private entries are only visible to you.
            </p>
            <p className="text-sm text-white/60">
              Want extra security? You can set up a passcode to lock private entries.
            </p>
            <a
              href={settingsLink}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium hover:opacity-80"
              style={{ color: accentColor }}
            >
              Set up passcode in Settings
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
      <div className="flex items-start gap-3">
        <Shield className="mt-0.5 h-5 w-5 text-green-400" />
        <div className="flex-1">
          <h4 className="mb-1 font-medium text-white">Private Entry Protected</h4>
          <p className="text-sm text-white/70">
            This private entry is protected by your passcode. Private entries are
            automatically locked after 15 minutes of viewing.
          </p>
        </div>
      </div>
    </div>
  );
}
