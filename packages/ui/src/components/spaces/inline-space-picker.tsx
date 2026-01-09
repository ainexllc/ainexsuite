'use client';

import { useState } from 'react';
import { FolderOpen, ChevronDown, Check } from 'lucide-react';
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
  className,
}: InlineSpacePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentSpaceName = currentSpace?.name || 'Personal';

  const handleSelectSpace = (spaceId: string) => {
    onSpaceChange(spaceId);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative flex-shrink-0 z-[9999]', className)}>
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
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-1 z-[9999] min-w-[160px] rounded-xl border shadow-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 p-1 backdrop-blur-xl opacity-100">
            {/* Space List */}
            {spaces.map((space) => {
              const isActive = space.id === currentSpace?.id;
              return (
                <button
                  key={space.id}
                  type="button"
                  onClick={() => handleSelectSpace(space.id)}
                  className={cn(
                    'flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-left transition rounded-lg',
                    isActive
                      ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  )}
                >
                  <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="flex-1 truncate">{space.name}</span>
                  {isActive && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default InlineSpacePicker;
