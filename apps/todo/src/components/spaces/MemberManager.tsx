'use client';

import { X, Users, UserPlus, Crown, Mail } from 'lucide-react';
import { useTodoStore } from '@/lib/store';

interface MemberManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemberManager({ isOpen, onClose }: MemberManagerProps) {
  const { currentSpaceId, getCurrentSpace } = useTodoStore();
  const currentSpace = getCurrentSpace();

  if (!isOpen) return null;

  const isVirtualSpace = currentSpaceId === 'all' || currentSpaceId === 'personal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-violet-100 dark:bg-violet-900/30">
              <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {currentSpace?.name || (currentSpaceId === 'all' ? 'All Spaces' : 'My Todos')} Members
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {isVirtualSpace ? 'Personal space' : 'Manage who has access'}
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
          {isVirtualSpace ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Crown className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                {currentSpaceId === 'all' ? 'All Spaces View' : 'Personal Space'}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                {currentSpaceId === 'all'
                  ? 'This view shows tasks from all your spaces. Select a specific space to manage members.'
                  : 'This is your personal space. Tasks here are private and only visible to you.'}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
                Select a family or team space to share tasks with others.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Member list */}
              {currentSpace?.members && currentSpace.members.length > 0 ? (
                <div className="space-y-2">
                  {currentSpace.members.map((member) => (
                    <div
                      key={member.uid}
                      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
                    >
                      <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-medium">
                        {member.displayName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {member.displayName}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No members in this space yet
                  </p>
                </div>
              )}

              {/* Invite button */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-violet-500 hover:text-violet-500 transition-colors">
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
            className="w-full py-2.5 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
