'use client';

import { useState } from 'react';
import { ChevronDown, User, Users, Briefcase, Heart, Folder, Dumbbell, Sparkles, Check } from 'lucide-react';
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
  /** Callback when user clicks "Manage Spaces" */
  onManageSpaces?: () => void;
  /** Callback when user clicks "Manage People" for current space */
  onManagePeople?: () => void;
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
  /** Size variant - 'default', 'compact', or 'mini' (pill style like habits app) */
  size?: 'default' | 'compact' | 'mini';
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
  buddy: Sparkles,
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
 *   onManageSpaces={() => setShowManageSpaces(true)}
 * />
 * ```
 */
export function SpaceSwitcher({
  spaces,
  currentSpaceId,
  onSpaceChange,
  onManageSpaces,
  onManagePeople,
  spacesLabel,
  defaultSpaceName,
  className = '',
  useAdminConfig = true,
  size = 'default',
}: SpaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch admin config from Firestore
  const { spaceTypes, uiConfig } = useSpacesConfig({ realtime: useAdminConfig });

  const currentSpace = spaces.find((s) => s.id === currentSpaceId);

  // Use admin config values with prop overrides
  const effectiveSpacesLabel = spacesLabel || 'Spaces';
  const effectiveDefaultName = defaultSpaceName || uiConfig.defaultSpaceLabel || 'Personal';
  const showManageButton = uiConfig.showCreateButton !== false && onManageSpaces;
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

  const handleManageSpaces = () => {
    setIsOpen(false);
    onManageSpaces?.();
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

  // Size-based styling
  const isMini = size === 'mini';
  const isCompact = size === 'compact' || isMini;
  const textSizeClass = isMini ? 'text-[12px]' : (isCompact ? 'text-xs' : 'text-sm');
  const subTextSizeClass = isCompact ? 'text-[10px]' : 'text-xs';
  const iconBoxClass = isMini ? '' : (isCompact ? 'h-6 w-6' : 'h-7 w-7');
  const iconSizeClass = isMini ? 'h-3.5 w-3.5' : (isCompact ? 'h-3 w-3' : 'h-4 w-4');
  const buttonPadding = isMini ? 'px-2.5 sm:px-3 py-1.5' : (isCompact ? 'px-2 py-2' : 'px-3 py-2.5');
  const buttonWidth = isMini ? '' : (isCompact ? 'min-w-[140px] max-w-[180px]' : 'min-w-[160px] max-w-[220px]');
  const dropdownItemPadding = isCompact ? 'px-2 py-1.5' : 'px-2 py-2';
  const buttonRounding = isMini ? 'rounded-full' : 'rounded-2xl';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${isMini ? 'gap-1 sm:gap-1.5' : 'gap-2'} ${buttonPadding} ${buttonRounding} border ${isMini ? '' : 'shadow-sm'} ${transitionClass} ${isMini ? '' : 'w-full'} ${buttonWidth} ${isMini ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
      >
        {showTypeIcons && (
          isMini ? (
            <Folder className="h-3.5 w-3.5" />
          ) : (
            <div
              className={`${iconBoxClass} rounded-md flex items-center justify-center text-white flex-shrink-0 bg-[#f97316]`}
            >
              {currentSpace ? getIcon(currentSpace.type) : <User className={iconSizeClass} />}
            </div>
          )
        )}
        {isMini ? (
          <span className="text-xs font-medium hidden sm:inline max-w-[80px] truncate">
            {currentSpace?.name || effectiveDefaultName}
          </span>
        ) : (
          <div className="flex-1 text-left min-w-0">
            <p className={`${textSizeClass} font-medium text-zinc-900 dark:text-zinc-100 leading-none truncate`}>
              {currentSpace?.name || effectiveDefaultName}
            </p>
            <p className={`${subTextSizeClass} text-zinc-500 dark:text-zinc-400 capitalize truncate mt-0.5`}>
              {currentSpace ? (getTypeConfig(currentSpace.type)?.label || currentSpace.type) : 'personal'}
            </p>
          </div>
        )}
        <ChevronDown className={`${isMini ? 'h-3 w-3' : iconSizeClass} text-zinc-400 dark:text-zinc-500 flex-shrink-0 ${transitionClass} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className={`absolute top-full ${isMini ? 'right-0 mt-1 min-w-[160px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-lg py-1' : 'left-0 mt-2 bg-popover border-border shadow-2xl p-1'} ${isMini ? '' : getDropdownClasses()} border rounded-xl z-30 overflow-hidden`}>
            {!isMini && (
              <div className="px-2 py-1.5 text-xs font-medium text-ink-400 uppercase">
                {effectiveSpacesLabel}
              </div>
            )}

              {/* User's spaces */}
              {spaces.map((space) => {
                const isActive = currentSpaceId === space.id;
                const typeConfig = getTypeConfig(space.type);

                return (
                  <button
                    key={space.id}
                    onClick={() => handleSelectSpace(space.id)}
                    className={`flex items-center gap-2 w-full ${isMini ? 'px-3 py-1.5 text-xs' : `${dropdownItemPadding} ${textSizeClass}`} ${isMini ? '' : 'rounded-lg'} text-left ${transitionClass} ${
                      isActive
                        ? (isMini ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'bg-[#f97316]/10 text-[#f97316]')
                        : (isMini ? 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800' : 'text-ink-600 hover:bg-surface-hover hover:text-ink-900')
                    }`}
                    style={!isMini && isActive ? getTypeStyle(space.type, true) : {}}
                  >
                    {showTypeIcons && (
                      <div className="flex-shrink-0" style={!isMini && isActive && typeConfig ? { color: typeConfig.color } : {}}>
                        {isMini ? <Folder className="h-3.5 w-3.5" /> : getIcon(space.type)}
                      </div>
                    )}
                    <span className="flex-1 truncate">{space.name}</span>
                    {isMini && isActive && <Check className="h-3.5 w-3.5" />}
                    {!isMini && showMemberCount && space.memberCount !== undefined && uiConfig.dropdownStyle === 'detailed' && (
                      <span className={`${subTextSizeClass} text-ink-400`}>{space.memberCount} member{space.memberCount !== 1 ? 's' : ''}</span>
                    )}
                  </button>
                );
              })}

            {(showManageButton || onManagePeople) && (
              <div className={`border-t ${isMini ? 'border-zinc-200 dark:border-zinc-700 mt-1 pt-1' : 'border-outline-subtle p-1'}`}>
                {/* Manage People button - only for non-personal spaces */}
                {onManagePeople && currentSpace && currentSpace.type !== 'personal' && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onManagePeople();
                    }}
                    className={`flex items-center gap-2 w-full ${isMini ? 'px-3 py-1.5 text-xs text-[var(--color-primary)] hover:bg-zinc-100 dark:hover:bg-zinc-800' : `${dropdownItemPadding} rounded-lg ${textSizeClass} text-[#f97316] hover:bg-surface-hover`} ${transitionClass}`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Manage People
                  </button>
                )}
                {showManageButton && (
                  <button
                    onClick={handleManageSpaces}
                    className={`flex items-center gap-2 w-full ${isMini ? 'px-3 py-1.5 text-xs text-[var(--color-primary)] hover:bg-zinc-100 dark:hover:bg-zinc-800' : `${dropdownItemPadding} rounded-lg ${textSizeClass} text-[#f97316] hover:bg-surface-hover`} ${transitionClass}`}
                  >
                    <Folder className="h-3.5 w-3.5" />
                    Manage Spaces
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

export default SpaceSwitcher;
