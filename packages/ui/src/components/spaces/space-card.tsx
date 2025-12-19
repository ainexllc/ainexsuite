'use client';

import { User, Users, Briefcase, Heart, Home, Star, Folder, Sparkles, Globe, Settings, MoreHorizontal } from 'lucide-react';
import type { SpaceType, SpaceColor, SpaceIcon, SpaceRole } from '@ainexsuite/types';
import { cn } from '../../lib/utils';

export interface SpaceCardProps {
  /** Space ID */
  id: string;
  /** Space name */
  name: string;
  /** Space type */
  type: SpaceType;
  /** Custom color */
  color?: SpaceColor;
  /** Custom icon */
  icon?: SpaceIcon;
  /** Whether this is a global space */
  isGlobal?: boolean;
  /** Number of members */
  memberCount?: number;
  /** User's role in this space */
  userRole?: SpaceRole;
  /** Item count (notes, tasks, etc.) */
  itemCount?: number;
  /** Created date */
  createdAt?: Date;
  /** Whether this space is currently selected */
  isSelected?: boolean;
  /** Whether this is the default/personal space */
  isDefault?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Settings click handler (for admins) */
  onSettingsClick?: () => void;
  /** Compact mode for dropdown lists */
  compact?: boolean;
}

const SPACE_TYPE_ICONS: Record<SpaceType, typeof User> = {
  personal: User,
  family: Users,
  work: Briefcase,
  couple: Heart,
  buddy: Users,
  squad: Users,
  project: Folder,
};

const SPACE_ICON_MAP: Record<SpaceIcon, typeof User> = {
  user: User,
  users: Users,
  home: Home,
  briefcase: Briefcase,
  heart: Heart,
  star: Star,
  folder: Folder,
  sparkles: Sparkles,
  globe: Globe,
};

const SPACE_COLOR_MAP: Record<SpaceColor, { bg: string; text: string; border: string }> = {
  red: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/30' },
  green: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/30' },
  gray: { bg: 'bg-zinc-500/10', text: 'text-zinc-500', border: 'border-zinc-500/30' },
  default: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30' },
};

const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  personal: 'Personal',
  family: 'Family',
  work: 'Work',
  couple: 'Couple',
  buddy: 'Buddy',
  squad: 'Squad',
  project: 'Project',
};

/**
 * SpaceCard - Visual card for displaying a space in lists
 */
export function SpaceCard({
  id,
  name,
  type,
  color = 'default',
  icon,
  isGlobal,
  memberCount = 1,
  userRole,
  itemCount,
  createdAt,
  isSelected,
  isDefault,
  onClick,
  onSettingsClick,
  compact = false,
}: SpaceCardProps) {
  // Determine icon to use
  const IconComponent = icon ? SPACE_ICON_MAP[icon] : SPACE_TYPE_ICONS[type];
  const colorClasses = SPACE_COLOR_MAP[color] || SPACE_COLOR_MAP.default;
  const isAdmin = userRole === 'admin';
  const isShared = memberCount > 1;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
          isSelected
            ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30'
            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
        )}
      >
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorClasses.bg)}>
          <IconComponent className={cn('h-4 w-4', colorClasses.text)} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {name}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {isShared ? `${memberCount} members` : SPACE_TYPE_LABELS[type]}
          </div>
        </div>
        {isGlobal && (
          <Globe className="h-3.5 w-3.5 text-zinc-400" />
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        'group relative rounded-xl border transition-all',
        isSelected
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            colorClasses.bg
          )}>
            <IconComponent className={cn('h-5 w-5', colorClasses.text)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {name}
              </h3>
              {isGlobal && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-500">
                  <Globe className="h-2.5 w-2.5" />
                  Global
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              {/* Type badge */}
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
                colorClasses.bg, colorClasses.text
              )}>
                {SPACE_TYPE_LABELS[type]}
              </span>

              {/* Member count */}
              {isShared && (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <Users className="h-3 w-3" />
                  {memberCount}
                </span>
              )}

              {/* Role badge */}
              {userRole && userRole !== 'admin' && isShared && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 capitalize">
                  {userRole}
                </span>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {itemCount !== undefined && (
                <span>{itemCount} items</span>
              )}
              {createdAt && (
                <span>
                  Created {createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
              {isDefault && (
                <span className="text-[var(--color-primary)]">Default</span>
              )}
            </div>
          </div>

          {/* Settings button (for admins) */}
          {isAdmin && onSettingsClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSettingsClick();
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              <Settings className="h-4 w-4 text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
      )}
    </div>
  );
}

export default SpaceCard;
