'use client';

import { Lock, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePrivacy } from '@/contexts/privacy-context';

interface PrivateEntryNoticeProps {
  isPrivate: boolean;
}

export function PrivateEntryNotice({ isPrivate }: PrivateEntryNoticeProps) {
  const { hasPasscode } = usePrivacy();

  if (!isPrivate) return null;

  if (!hasPasscode) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-white mb-1">
              Private Entry
            </h4>
            <p className="text-sm text-white/70 mb-2">
              This entry is marked as private. Your private entries are only visible to you.
            </p>
            <p className="text-sm text-white/60">
              Want extra security? You can set up a passcode to lock private entries.
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1 text-sm text-[#f97316] hover:text-[#ea580c] mt-2 font-medium"
            >
              Set up passcode in Settings
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-green-400 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-white mb-1">
            Private Entry Protected
          </h4>
          <p className="text-sm text-white/70">
            This private entry is protected by your passcode.
            Private entries are automatically locked after 15 minutes of viewing.
          </p>
        </div>
      </div>
    </div>
  );
}
