'use client';

import { X, Users, UserPlus, Crown, Mail } from 'lucide-react';
import { useSpaces } from '@/components/providers/spaces-provider';

interface MemberManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemberManager({ isOpen, onClose }: MemberManagerProps) {
  const { currentSpaceId, spaces } = useSpaces();
  const currentSpace = spaces.find((s) => s.id === currentSpaceId);

  if (!isOpen) return null;

  const isPersonalSpace = !currentSpace || currentSpace.type === 'personal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {currentSpace?.name || 'Personal'} Members
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {isPersonalSpace ? 'Personal space' : 'Manage who has access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isPersonalSpace ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Crown className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Personal Space
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                This is your personal space. Projects here are private and only visible to you.
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
                Select a team or custom space to collaborate on projects with others.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Member list would go here */}
              <div className="text-center py-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Member management coming soon
                </p>
              </div>

              {/* Invite button */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors">
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Invite Member</span>
              </button>

              {/* Email invite option */}
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Mail className="w-4 h-4" />
                <span>Or invite via email</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
