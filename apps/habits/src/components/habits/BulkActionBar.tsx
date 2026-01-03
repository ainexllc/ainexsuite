'use client';

import { useState } from 'react';
import { X, Trash2, FolderInput, Users, Loader2 } from 'lucide-react';
import { ConfirmationDialog } from '@ainexsuite/ui';
import { useHabitSelectionContext } from '@/components/providers/selection-provider';
import { useGrowStore } from '@/lib/store';
import { useSpaces } from '@/components/providers/spaces-provider';
import { cn } from '@/lib/utils';
import type { Member } from '@/types/models';

interface BulkActionBarProps {
  onAssignMembers?: (habitIds: string[], memberIds: string[]) => void;
}

export function BulkActionBar({ onAssignMembers }: BulkActionBarProps) {
  const { selectedIds, selectionCount, exitSelectMode } = useHabitSelectionContext();
  const { bulkDeleteHabits, bulkUpdateHabits } = useGrowStore();
  const { allSpaces, currentSpace } = useSpaces();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSpaceMenu, setShowSpaceMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (selectionCount === 0) return null;

  const habitIds = Array.from(selectedIds);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await bulkDeleteHabits(habitIds);
      exitSelectMode();
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleMoveToSpace = async (spaceId: string) => {
    setIsLoading(true);
    try {
      await bulkUpdateHabits(habitIds, { spaceId });
      exitSelectMode();
    } finally {
      setIsLoading(false);
      setShowSpaceMenu(false);
    }
  };

  const handleAssign = async (memberIds: string[]) => {
    setIsLoading(true);
    try {
      await bulkUpdateHabits(habitIds, { assigneeIds: memberIds });
      onAssignMembers?.(habitIds, memberIds);
      exitSelectMode();
    } finally {
      setIsLoading(false);
      setShowAssignMenu(false);
    }
  };

  // Get available spaces (excluding current)
  const availableSpaces = allSpaces.filter(s => s.id !== currentSpace?.id);

  // Get members from current space
  const members: Member[] = currentSpace?.members || [];

  return (
    <>
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Selected Habits?"
        description={`You are about to delete ${selectionCount} habit${selectionCount > 1 ? 's' : ''}. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Bulk Action Bar */}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
        <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl">
          {/* Close / Deselect */}
          <button
            onClick={exitSelectMode}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Cancel selection"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Selection count */}
          <div className="px-3 py-1 bg-indigo-500/20 rounded-lg">
            <span className="text-sm font-medium text-indigo-300">
              {selectionCount} selected
            </span>
          </div>

          <div className="w-px h-6 bg-zinc-700" />

          {/* Assign to Members */}
          {members.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowAssignMenu(!showAssignMenu)}
                disabled={isLoading}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'text-zinc-300 hover:text-white hover:bg-zinc-800'
                )}
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Assign</span>
              </button>

              {showAssignMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-xs font-medium text-zinc-500 border-b border-zinc-700">
                    Assign to members
                  </div>
                  {members.map((member) => (
                    <button
                      key={member.uid}
                      onClick={() => handleAssign([member.uid])}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <div className="h-6 w-6 rounded-full bg-zinc-600 flex items-center justify-center text-xs font-medium">
                        {member.displayName.slice(0, 2).toUpperCase()}
                      </div>
                      {member.displayName}
                    </button>
                  ))}
                  <div className="border-t border-zinc-700 mt-1 pt-1">
                    <button
                      onClick={() => handleAssign(members.map(m => m.uid))}
                      className="w-full px-3 py-2 text-left text-sm text-indigo-400 hover:bg-zinc-700 transition-colors"
                    >
                      Assign to all
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Move to Space */}
          {availableSpaces.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSpaceMenu(!showSpaceMenu)}
                disabled={isLoading}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'text-zinc-300 hover:text-white hover:bg-zinc-800'
                )}
              >
                <FolderInput className="h-4 w-4" />
                <span className="hidden sm:inline">Move</span>
              </button>

              {showSpaceMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-xs font-medium text-zinc-500 border-b border-zinc-700">
                    Move to space
                  </div>
                  {availableSpaces.map((space) => (
                    <button
                      key={space.id}
                      onClick={() => handleMoveToSpace(space.id)}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      {space.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delete */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              'text-red-400 hover:text-red-300 hover:bg-red-500/10'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </>
  );
}
