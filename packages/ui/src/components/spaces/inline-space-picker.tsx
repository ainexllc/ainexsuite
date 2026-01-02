'use client';

import { useState } from 'react';
import { FolderOpen, ChevronDown, Check, Users, Settings } from 'lucide-react';
import type { SpaceType } from '@ainexsuite/types';
import { cn } from '../../lib/utils';

export interface InlineSpaceItem {
  id: string;
  name: string;
  type: SpaceType;
}

export interface InlineSpacePickerProps {
  /** List of available spaces */
  spaces: InlineSpaceItem[];
  /** Currently selected space */
  currentSpace: InlineSpaceItem | null;
  /** Callback when user selects a space */
  onSpaceChange: (spaceId: string) => void;
  /** Callback when user clicks "Manage People" */
  onManagePeople?: () => void;
  /** Callback when user clicks "Manage Spaces" */
  onManageSpaces?: () => void;
  /** Custom class for the container */
  className?: string;
}

/**
 * Inline space picker component for composer bars.
 * Shows a compact pill button that expands into a dropdown for space selection.
 * Used in collapsed composer states across apps.
 */
export function InlineSpacePicker({
  spaces,
  currentSpace,
  onSpaceChange,
  onManagePeople,
  onManageSpaces,
  className,
}: InlineSpacePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentSpaceName = currentSpace?.name || 'Personal';

  // Check if there are any non-personal (shared) spaces
  const hasSharedSpaces = spaces.some((s) => s.type !== 'personal');

  const handleSelectSpace = (spaceId: string) => {
    onSpaceChange(spaceId);
    setIsOpen(false);
  };

  const handleManagePeople = () => {
    setIsOpen(false);
    onManagePeople?.();
  };

  const handleManageSpaces = () => {
    setIsOpen(false);
    onManageSpaces?.();
  };

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        <FolderOpen className="h-3.5 w-3.5" />
        <span className="hidden sm:inline max-w-[80px] truncate">{currentSpaceName}</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-1 z-30 min-w-[160px] rounded-xl border shadow-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 py-1">
            {/* Space List */}
            {spaces.map((space) => {
              const isActive = space.id === currentSpace?.id;
              return (
                <button
                  key={space.id}
                  type="button"
                  onClick={() => handleSelectSpace(space.id)}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left transition',
                    isActive
                      ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  )}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span className="flex-1 truncate">{space.name}</span>
                  {isActive && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}

            {/* Action Buttons */}
            {(onManagePeople || onManageSpaces) && (
              <div className="border-t border-zinc-200 dark:border-zinc-700 mt-1 pt-1">
                {/* Manage People - show when there are shared spaces */}
                {hasSharedSpaces && onManagePeople && (
                  <button
                    type="button"
                    onClick={handleManagePeople}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left text-[var(--color-primary)] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Manage People</span>
                  </button>
                )}

                {/* Manage Spaces */}
                {onManageSpaces && (
                  <button
                    type="button"
                    onClick={handleManageSpaces}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left text-[var(--color-primary)] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Manage Spaces</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default InlineSpacePicker;
