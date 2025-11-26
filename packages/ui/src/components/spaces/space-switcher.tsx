'use client';

import { useState } from 'react';
import { ChevronDown, Plus, User, Users, Briefcase, Heart, Folder, Dumbbell, Sparkles } from 'lucide-react';
import type { SpaceType } from '@ainexsuite/types';
import { useSpacesConfig, type SpaceTypeConfig } from '../../hooks/use-spaces-config';

/**
 * Space item for the dropdown - this is the minimal interface apps need to provide
 */
export interface SpaceItem {
  id: string;
  name: string;
  type: SpaceType;
  memberCount?: number;
}

/**
 * Configuration for space type display (deprecated - use admin config instead)
 * @deprecated Use admin panel to configure space types
 */
export interface SpaceTypeConfigLegacy {
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
  /** Label shown above the spaces list (default from admin config or "My Spaces") */
  spacesLabel?: string;
  /** Default name shown when no space is selected (default from admin config or "Personal") */
  defaultSpaceName?: string;
  /** Available space types to filter (default: all enabled types from admin) */
  availableTypes?: SpaceType[];
  /** Custom class for the trigger button */
  className?: string;
  /** Whether to use admin config from Firestore (default: true) */
  useAdminConfig?: boolean;
}

// Icon mapping from string to component
const ICON_MAP: Record<string, typeof User> = {
  user: User,
  users: Users,
  heart: Heart,
  briefcase: Briefcase,
  dumbbell: Dumbbell,
  folder: Folder,
  sparkles: Sparkles,
};

// Fallback icon mapping by space type
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
 * Reads configuration from Firestore (set via admin panel) for centralized control.
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
  spacesLabel,
  defaultSpaceName,
  className = '',
  useAdminConfig = true,
}: SpaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch admin config from Firestore
  const { spaceTypes, uiConfig, loading } = useSpacesConfig({ realtime: useAdminConfig });

  const currentSpace = spaces.find((s) => s.id === currentSpaceId);

  // Use admin config values with prop overrides
  const effectiveSpacesLabel = spacesLabel || 'My Spaces';
  const effectiveDefaultName = defaultSpaceName || uiConfig.defaultSpaceLabel || 'Personal';
  const showCreateButton = uiConfig.showCreateButton !== false && onCreateSpace;
  const showTypeIcons = uiConfig.showTypeIcons !== false;
  const showMemberCount = uiConfig.showMemberCount !== false;
  const animateTransitions = uiConfig.animateTransitions !== false;

  const getTypeConfig = (type: SpaceType): SpaceTypeConfig | undefined => {
    return spaceTypes.find((t) => t.id === type);
  };

  const getIcon = (type: SpaceType) => {
    const typeConfig = getTypeConfig(type);
    if (typeConfig?.icon) {
      const IconComponent = ICON_MAP[typeConfig.icon] || User;
      return <IconComponent className="h-4 w-4" />;
    }
    // Fallback to default icons
    const Icon = SPACE_TYPE_ICONS[type] || User;
    return <Icon className="h-4 w-4" />;
  };

  const getTypeStyle = (type: SpaceType, isActive: boolean) => {
    const typeConfig = getTypeConfig(type);
    if (typeConfig && isActive) {
      return {
        backgroundColor: typeConfig.bgColor,
        borderColor: typeConfig.borderColor,
        color: typeConfig.color,
      };
    }
    return {};
  };

  const handleSelectSpace = (spaceId: string) => {
    onSpaceChange(spaceId);
    setIsOpen(false);
  };

  const handleCreateSpace = () => {
    setIsOpen(false);
    onCreateSpace?.();
  };

  // Dropdown style variations
  const getDropdownClasses = () => {
    switch (uiConfig.dropdownStyle) {
      case 'compact':
        return 'min-w-[160px] max-w-[240px]';
      case 'minimal':
        return 'min-w-full w-max max-w-sm';
      case 'detailed':
      default:
        return 'min-w-full w-max max-w-sm';
    }
  };

  const transitionClass = animateTransitions ? 'transition-all duration-200' : '';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover ${transitionClass} w-full min-w-[180px] max-w-[280px]`}
      >
        {showTypeIcons && (
          <div
            className="h-8 w-8 rounded-md flex items-center justify-center text-white flex-shrink-0"
            style={currentSpace ? {
              background: `linear-gradient(to bottom right, ${getTypeConfig(currentSpace.type)?.color || 'var(--color-primary)'}, ${getTypeConfig(currentSpace.type)?.color || 'var(--color-primary-dark, var(--color-primary))'})`,
            } : {
              background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-primary-dark, var(--color-primary)))',
            }}
          >
            {currentSpace ? getIcon(currentSpace.type) : <User className="h-4 w-4" />}
          </div>
        )}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-ink-900 leading-none truncate">
            {currentSpace?.name || effectiveDefaultName}
          </p>
          <p className="text-xs text-ink-500 capitalize truncate">
            {currentSpace ? (getTypeConfig(currentSpace.type)?.label || currentSpace.type) : 'personal'}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-ink-500 flex-shrink-0 ${transitionClass} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className={`absolute top-full left-0 ${getDropdownClasses()} mt-2 bg-surface-elevated border border-outline-subtle rounded-xl shadow-floating z-50 overflow-hidden`}>
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-ink-400 uppercase">
                {effectiveSpacesLabel}
              </div>

              {/* Personal space (virtual) */}
              <button
                onClick={() => handleSelectSpace('personal')}
                className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm ${transitionClass} ${
                  currentSpaceId === 'personal' || !currentSpaceId
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-ink-600 hover:bg-surface-hover hover:text-ink-900'
                }`}
                style={currentSpaceId === 'personal' || !currentSpaceId ? getTypeStyle('personal', true) : {}}
              >
                {showTypeIcons && (
                  <div className="flex-shrink-0">
                    {getIcon('personal')}
                  </div>
                )}
                <span className="truncate flex-1 text-left">{effectiveDefaultName}</span>
              </button>

              {/* User's spaces */}
              {spaces.map((space) => {
                const isActive = currentSpaceId === space.id;
                const typeConfig = getTypeConfig(space.type);

                return (
                  <button
                    key={space.id}
                    onClick={() => handleSelectSpace(space.id)}
                    className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm ${transitionClass} ${
                      isActive
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'text-ink-600 hover:bg-surface-hover hover:text-ink-900'
                    }`}
                    style={isActive ? getTypeStyle(space.type, true) : {}}
                  >
                    {showTypeIcons && (
                      <div className="flex-shrink-0" style={isActive && typeConfig ? { color: typeConfig.color } : {}}>
                        {getIcon(space.type)}
                      </div>
                    )}
                    <div className="flex-1 text-left min-w-0">
                      <span className="truncate block">{space.name}</span>
                      {showMemberCount && space.memberCount !== undefined && uiConfig.dropdownStyle === 'detailed' && (
                        <span className="text-xs text-ink-400">{space.memberCount} member{space.memberCount !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showCreateButton && (
              <div className="border-t border-outline-subtle p-1">
                <button
                  onClick={handleCreateSpace}
                  className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-[var(--color-primary)] hover:bg-surface-hover ${transitionClass}`}
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
