'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { useAppColors } from '@ainexsuite/theme';

/**
 * Props for the ContentHeader component
 */
export interface ContentHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Header title */
  title: string;
  /** Optional subtitle/description below the title */
  subtitle?: string;
  /** Optional icon to display next to title */
  icon?: React.ReactNode;
  /** Trailing content to display on the right side (badges, actions, etc.) */
  trailing?: React.ReactNode;
  /** Whether to show a divider line below the header */
  divider?: boolean;
  /** Accent color override (hex). Falls back to app theme primary */
  accentColor?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ContentHeader - Header for content areas like cards and panels
 *
 * A smaller header component designed for nested content areas such as cards,
 * panels, and modals. Features compact styling with optional icons and trailing content.
 *
 * @example
 * ```tsx
 * // Basic content header
 * <div className="card">
 *   <ContentHeader title="Profile Settings" />
 *   <div className="p-4">...</div>
 * </div>
 *
 * // With icon and divider
 * <ContentHeader
 *   title="Notifications"
 *   icon={<Bell className="h-4 w-4" />}
 *   divider
 * />
 *
 * // With subtitle and trailing badge
 * <ContentHeader
 *   title="Recent Updates"
 *   subtitle="Last 7 days"
 *   trailing={<span className="badge">New</span>}
 * />
 *
 * // In a card with custom accent
 * <div className="card">
 *   <ContentHeader
 *     title="Active Projects"
 *     icon={<Folder className="h-4 w-4" />}
 *     trailing={
 *       <button className="text-sm text-accent-500">View all</button>
 *     }
 *     divider
 *     accentColor="#f97316"
 *   />
 *   <div className="p-4">...</div>
 * </div>
 * ```
 */
export const ContentHeader = React.forwardRef<HTMLDivElement, ContentHeaderProps>(
  (
    {
      title,
      subtitle,
      icon,
      trailing,
      divider = false,
      accentColor,
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
      '--content-header-accent': effectiveAccentColor,
    } as React.CSSProperties : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          'px-4 py-3',
          divider && 'border-b border-border',
          className
        )}
        style={themeStyles}
        {...props}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon + Title */}
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            {/* Icon */}
            {icon && (
              <div
                className="flex-shrink-0 flex items-center justify-center mt-0.5"
                style={{ color: effectiveAccentColor }}
              >
                {React.isValidElement(icon)
                  ? React.cloneElement(icon as React.ReactElement<any>, {
                      className: cn('h-4 w-4', (icon as any).props?.className),
                    })
                  : icon}
              </div>
            )}

            {/* Title and subtitle */}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Trailing content */}
          {trailing && (
            <div className="flex-shrink-0 flex items-center text-sm">
              {trailing}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ContentHeader.displayName = 'ContentHeader';
