'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Users, Settings, User, Heart, Briefcase, UserPlus, Users2, FolderKanban } from 'lucide-react';
import type { SpaceType } from '@ainexsuite/types';
import { cn } from '../../lib/utils';

const SPACE_COLORS: Record<SpaceType, string> = {
  personal: '#3b82f6',
  couple: '#ec4899',
  family: '#8b5cf6',
  work: '#f97316',
  buddy: '#10b981',
  squad: '#06b6d4',
  project: '#6366f1',
};

const SPACE_ICONS: Record<SpaceType, typeof User> = {
  personal: User,
  couple: Heart,
  family: Users,
  work: Briefcase,
  buddy: UserPlus,
  squad: Users2,
  project: FolderKanban,
};

export interface SpaceTabItem {
  id: string;
  name: string;
  type: SpaceType;
}

export interface SpaceTabSelectorProps {
  /** List of available spaces */
  spaces: SpaceTabItem[];
  /** Currently selected space ID */
  currentSpaceId: string;
  /** Callback when user selects a space */
  onSpaceChange: (spaceId: string) => void;
  /** Custom class for the container */
  className?: string;
  /** Whether to show a "Personal" option (default: true) */
  showPersonal?: boolean;
  /** Label for the personal space (default: "Personal") */
  personalLabel?: string;
  /** Callback when user clicks manage people */
  onManagePeople?: () => void;
  /** Callback when user clicks manage spaces */
  onManageSpaces?: () => void;
}

/**
 * Horizontal tab selector for spaces.
 * Shows spaces as pill-style tabs centered above forms/composers.
 * Can be used across multiple apps for consistent space selection.
 */
export function SpaceTabSelector({
  spaces,
  currentSpaceId,
  onSpaceChange,
  className,
  showPersonal = true,
  personalLabel = 'Personal',
  onManagePeople,
  onManageSpaces,
}: SpaceTabSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Build the list of spaces to display
  const displaySpaces: SpaceTabItem[] = useMemo(() =>
    showPersonal
      ? [{ id: 'personal', name: personalLabel, type: 'personal' as SpaceType }, ...spaces.filter(s => s.id !== 'personal')]
      : spaces,
    [showPersonal, personalLabel, spaces]
  );

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setShowLeftArrow(el.scrollLeft > 0);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [displaySpaces]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = 150;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // If only one space (personal), don't show the selector
  if (displaySpaces.length <= 1) {
    return null;
  }

  // Check if we should show management buttons
  const showManagement = onManagePeople || onManageSpaces;

  return (
    <div className={cn('relative flex items-center justify-center gap-3', className)}>
      {/* Left scroll arrow */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm text-muted-foreground hover:text-foreground transition"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Tabs container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide px-2 py-1 max-w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex-shrink-0">Space:</span>
          <div className="flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 p-1">
            {displaySpaces.map((space) => {
            const isActive = space.id === currentSpaceId ||
              (space.id === 'personal' && !currentSpaceId);
            const SpaceIcon = SPACE_ICONS[space.type] || User;
            const spaceColor = SPACE_COLORS[space.type] || '#3b82f6';

            return (
              <button
                key={space.id}
                type="button"
                onClick={() => onSpaceChange(space.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
                )}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: spaceColor }}
                >
                  <SpaceIcon className="w-3 h-3 text-white" />
                </div>
                {space.name}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {/* Right scroll arrow */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm text-muted-foreground hover:text-foreground transition"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Management icons */}
      {showManagement && (
        <div className="flex items-center gap-2">
          {onManagePeople && (
            <button
              type="button"
              onClick={onManagePeople}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label="Manage people"
              title="Manage people"
            >
              <Users className="h-[18px] w-[18px]" />
            </button>
          )}
          {onManageSpaces && (
            <button
              type="button"
              onClick={onManageSpaces}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label="Manage spaces"
              title="Manage spaces"
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SpaceTabSelector;
