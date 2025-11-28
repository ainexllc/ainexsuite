'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { useAppColors } from '@ainexsuite/theme';

/**
 * Props for the SectionHeader component
 */
export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section title */
  title: string;
  /** Optional subtitle/description below the title */
  subtitle?: string;
  /** Optional icon to display next to title */
  icon?: React.ReactNode;
  /** Action element to display on the right (button, link, etc.) */
  action?: React.ReactNode;
  /** Optional count or badge to display next to title */
  count?: number | string;
  /** Visual size variant */
  variant?: 'default' | 'large' | 'small';
  /** Accent color override (hex). Falls back to app theme primary */
  accentColor?: string;
  /** Whether to show a divider line below the header */
  divider?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SectionHeader - Section divider with title and optional actions
 *
 * A header component for dividing content into logical sections within a page.
 * Supports icons, counts, actions, and bottom dividers for clear visual separation.
 *
 * @example
 * ```tsx
 * // Basic section header
 * <SectionHeader title="Recent Activity" />
 *
 * // With icon and count
 * <SectionHeader
 *   title="Tasks"
 *   icon={<CheckSquare className="h-5 w-5" />}
 *   count={12}
 * />
 *
 * // With subtitle and action
 * <SectionHeader
 *   title="Team Members"
 *   subtitle="People in your workspace"
 *   action={<button className="btn-sm">Invite</button>}
 *   divider
 * />
 *
 * // Large variant
 * <SectionHeader
 *   variant="large"
 *   title="Dashboard"
 *   icon={<LayoutDashboard className="h-6 w-6" />}
 *   count="3 active"
 * />
 * ```
 */
export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      title,
      subtitle,
      icon,
      action,
      count,
      variant = 'default',
      accentColor,
      divider = false,
      className,
      ...props
    },
    ref
  ) => {
    const { primary, loading } = useAppColors();

    // Use provided accent color or fall back to app theme color
    const effectiveAccentColor = accentColor || primary;

    // Don't render custom colors until theme is loaded to prevent flash
    const themeStyles = !loading && effectiveAccentColor ? {
      '--section-header-accent': effectiveAccentColor,
    } as React.CSSProperties : undefined;

    // Variant-specific configurations
    const variantConfig = {
      small: {
        container: 'py-2',
        title: 'text-sm font-semibold',
        subtitle: 'text-xs',
        icon: 'h-4 w-4',
        count: 'text-xs px-2 py-0.5',
      },
      default: {
        container: 'py-3',
        title: 'text-base md:text-lg font-semibold',
        subtitle: 'text-sm',
        icon: 'h-5 w-5',
        count: 'text-xs px-2.5 py-1',
      },
      large: {
        container: 'py-4',
        title: 'text-xl md:text-2xl font-bold',
        subtitle: 'text-base',
        icon: 'h-6 w-6',
        count: 'text-sm px-3 py-1',
      },
    };

    const config = variantConfig[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          config.container,
          divider && 'border-b border-white/10 pb-3 mb-3',
          className
        )}
        style={themeStyles}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon + Title + Count */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Icon */}
            {icon && (
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{ color: effectiveAccentColor }}
              >
                {React.isValidElement(icon)
                  ? React.cloneElement(icon as React.ReactElement<any>, {
                      className: cn(config.icon, (icon as any).props?.className),
                    })
                  : icon}
              </div>
            )}

            {/* Title and subtitle */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className={cn(
                  'text-white',
                  config.title
                )}>
                  {title}
                </h2>
                {/* Count badge */}
                {count !== undefined && (
                  <span
                    className={cn(
                      'rounded-full font-medium',
                      config.count
                    )}
                    style={{
                      backgroundColor: `${effectiveAccentColor}20`,
                      color: effectiveAccentColor,
                    }}
                  >
                    {count}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className={cn(
                  'mt-0.5 text-white/60',
                  config.subtitle
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Action */}
          {action && (
            <div className="flex-shrink-0 flex items-center">
              {action}
            </div>
          )}
        </div>
      </div>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';
