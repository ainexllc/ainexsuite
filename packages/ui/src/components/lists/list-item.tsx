'use client';

import * as React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

type ListItemVariant = 'default' | 'compact' | 'detailed';

export interface ListItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Primary title text
   */
  title: React.ReactNode;

  /**
   * Optional subtitle or secondary text
   */
  subtitle?: React.ReactNode;

  /**
   * Optional icon component to display before the title
   */
  icon?: LucideIcon;

  /**
   * Optional trailing content (right side) - badges, actions, etc.
   */
  trailing?: React.ReactNode;

  /**
   * Optional href to make the item a link
   */
  href?: string;

  /**
   * Whether the item is currently selected
   * @default false
   */
  selected?: boolean;

  /**
   * Whether the item is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Visual variant of the list item
   * @default 'default'
   */
  variant?: ListItemVariant;
}

/**
 * ListItem Component
 *
 * A flexible list item component with support for icons, subtitles, trailing content,
 * links, selection states, and multiple visual variants.
 *
 * Uses glassmorphism styling with bg-white/5 and border-white/10 for consistency.
 *
 * @example
 * ```tsx
 * // Default list item
 * <ListItem
 *   title="My Task"
 *   subtitle="Due tomorrow"
 *   icon={CheckCircle}
 *   trailing={<Badge>High</Badge>}
 * />
 *
 * // Compact variant
 * <ListItem
 *   title="Quick note"
 *   variant="compact"
 *   onClick={() => {}}
 * />
 *
 * // As a link with selection
 * <ListItem
 *   title="Navigation Item"
 *   href="/path"
 *   selected
 * />
 * ```
 */
export const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  (
    {
      title,
      subtitle,
      icon: Icon,
      trailing,
      href,
      onClick,
      selected = false,
      disabled = false,
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const isInteractive = Boolean(onClick || href);

    const baseStyles = cn(
      'rounded-2xl border transition-all duration-200',
      // Glassmorphism styling
      'bg-white/5 backdrop-blur-sm',
      // Border states
      selected ? 'border-white/30' : 'border-white/10',
      // Interactive states
      isInteractive && !disabled && 'cursor-pointer',
      isInteractive && !disabled && 'hover:bg-white/10 hover:border-white/20',
      isInteractive && !disabled && 'active:scale-[0.98]',
      // Selected state
      selected && 'bg-white/10 shadow-lg',
      // Disabled state
      disabled && 'opacity-50 cursor-not-allowed',
      className
    );

    const variantStyles = {
      default: 'p-4',
      compact: 'p-3',
      detailed: 'p-5',
    };

    const content = (
      <div className={cn('flex items-start gap-3', variant === 'compact' && 'gap-2')}>
        {Icon && (
          <div className="flex-shrink-0 pt-0.5">
            <Icon
              className={cn(
                'text-white/60',
                variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5'
              )}
              aria-hidden
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className={cn(
            'font-medium text-white/90',
            variant === 'compact' ? 'text-sm' : 'text-base'
          )}>
            {title}
          </div>
          {subtitle && (
            <div className={cn(
              'text-white/50 mt-1',
              variant === 'compact' ? 'text-xs' : 'text-sm'
            )}>
              {subtitle}
            </div>
          )}
        </div>

        {trailing && (
          <div className="flex-shrink-0 flex items-center">
            {trailing}
          </div>
        )}
      </div>
    );

    if (href && !disabled) {
      return (
        <Link href={href} passHref legacyBehavior>
          <a
            className={cn(baseStyles, variantStyles[variant])}
            onClick={onClick ? (onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>) : undefined}
            role="button"
            tabIndex={0}
            aria-selected={selected || undefined}
          >
            {content}
          </a>
        </Link>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant])}
        onClick={disabled ? undefined : onClick}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive && !disabled ? 0 : undefined}
        aria-disabled={disabled || undefined}
        aria-selected={selected || undefined}
        {...props}
      >
        {content}
      </div>
    );
  }
);

ListItem.displayName = 'ListItem';
