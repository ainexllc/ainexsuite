'use client';

import { useState } from 'react';
import { ChevronDown, Plus, User, Users, Briefcase, Heart, Folder, Dumbbell } from 'lucide-react';
import type { SpaceType } from '@ainexsuite/types';

/**
 * Space item for the dropdown - this is the minimal interface apps need to provide
 */
export interface SpaceItem {
  id: string;
  name: string;
  type: SpaceType;
}

/**
 * Configuration for space type display
 */
export interface SpaceTypeConfig {
  value: SpaceType;
  label: string;
  description: string;
}

export interface SpaceSwitcherProps {
  /** List of available spaces */
  spaces: SpaceItem[];
  /** Currently selected space ID */
  currentSpaceId: string | null;
  /** Callback when user selects a space */
  onSpaceChange: (spaceId: string) => void;
  /** Callback when user clicks "Create New Space" */
  onCreateSpace?: () => void;
  /** Label shown above the spaces list (default: "My Spaces") */
  spacesLabel?: string;
  /** Default name shown when no space is selected (default: "Personal") */
  defaultSpaceName?: string;
  /** Available space types to filter (default: all types) */
  availableTypes?: SpaceType[];
  /** Custom class for the trigger button */
  className?: string;
}

const SPACE_TYPE_ICONS: Record<SpaceType, typeof User> = {
  personal: User,
  family: Users,
  work: Briefcase,
  couple: Heart,
  buddy: Dumbbell,
  squad: Users,
  project: Folder,
};

/**
 * Shared SpaceSwitcher component for consistent UI across all apps.
 *
 * Usage:
 * ```tsx
 * <SpaceSwitcher
 *   spaces={spaces}
 *   currentSpaceId={currentSpaceId}
 *   onSpaceChange={setCurrentSpace}
 *   onCreateSpace={() => setShowEditor(true)}
 * />
 * ```
 */
export function SpaceSwitcher({
  spaces,
  currentSpaceId,
  onSpaceChange,
  onCreateSpace,
  spacesLabel = 'My Spaces',
  defaultSpaceName = 'Personal',
  className = '',
}: SpaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId);

  const getIcon = (type: SpaceType) => {
    const Icon = SPACE_TYPE_ICONS[type] || User;
    return <Icon className="h-4 w-4" />;
  };

  const handleSelectSpace = (spaceId: string) => {
    onSpaceChange(spaceId);
    setIsOpen(false);
  };

  const handleCreateSpace = () => {
    setIsOpen(false);
    onCreateSpace?.();
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors w-full min-w-[180px] max-w-[280px]"
      >
        <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark,var(--color-primary))] flex items-center justify-center text-white flex-shrink-0">
          {currentSpace ? getIcon(currentSpace.type) : <User className="h-4 w-4" />}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-ink-900 leading-none truncate">
            {currentSpace?.name || defaultSpaceName}
          </p>
          <p className="text-xs text-ink-500 capitalize truncate">
            {currentSpace?.type || 'personal'}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-ink-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 min-w-full w-max max-w-sm mt-2 bg-surface-elevated border border-outline-subtle rounded-xl shadow-floating z-50 overflow-hidden">
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-ink-400 uppercase">
                {spacesLabel}
              </div>

              {/* Personal space (virtual) */}
              <button
                onClick={() => handleSelectSpace('personal')}
                className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm transition-colors ${
                  currentSpaceId === 'personal' || !currentSpaceId
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-ink-600 hover:bg-surface-hover hover:text-ink-900'
                }`}
              >
                <div className="flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <span className="truncate">{defaultSpaceName}</span>
              </button>

              {/* User's spaces */}
              {spaces.map((space) => (
                <button
                  key={space.id}
                  onClick={() => handleSelectSpace(space.id)}
                  className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm transition-colors ${
                    currentSpaceId === space.id
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'text-ink-600 hover:bg-surface-hover hover:text-ink-900'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getIcon(space.type)}
                  </div>
                  <span className="truncate">{space.name}</span>
                </button>
              ))}
            </div>

            {onCreateSpace && (
              <div className="border-t border-outline-subtle p-1">
                <button
                  onClick={handleCreateSpace}
                  className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-[var(--color-primary)] hover:bg-surface-hover transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create New Space
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SpaceSwitcher;
