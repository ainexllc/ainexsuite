'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { useAppColors } from '@ainexsuite/theme';

/**
 * Trend data for displaying statistics movement
 */
export interface StatsTrend {
  /** Percentage or numeric value of the trend (e.g., 12.5) */
  value: number;
  /** Whether the trend is positive (true) or negative (false) */
  isPositive: boolean;
  /** Optional label to display alongside the trend (e.g., "vs last week") */
  label?: string;
}

/**
 * Props for the StatsCard component
 */
export interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Label for the statistic */
  title: string;
  /** The main value to display (can be string or number) */
  value: string | number;
  /** Optional icon component to display (ReactNode for flexibility) */
  icon?: React.ReactNode;
  /** Optional trend data to show statistical movement */
  trend?: StatsTrend;
  /** Optional description or subtitle */
  subtitle?: string;
  /** Optional accent color override (hex color). If not provided, uses app theme colors */
  accentColor?: string;
  /** Visual variant of the card */
  variant?: 'default' | 'compact' | 'detailed';
  /** Additional CSS classes */
  className?: string;
}

/**
 * StatsCard - A flexible statistics display card with multiple variants
 *
 * Displays key metrics with optional icons, trends, and subtitles.
 * Automatically uses app theme colors from context, with optional override.
 *
 * @example
 * ```tsx
 * // Default variant
 * <StatsCard
 *   title="Total Entries"
 *   value={127}
 *   icon={<BookOpen className="h-5 w-5" />}
 *   trend={{ value: 12.5, isPositive: true, label: "vs last week" }}
 *   subtitle="Journal entries this month"
 * />
 *
 * // Compact variant
 * <StatsCard
 *   variant="compact"
 *   title="Streak"
 *   value="7 days"
 *   icon={<Flame className="h-4 w-4" />}
 * />
 *
 * // Detailed variant with custom accent
 * <StatsCard
 *   variant="detailed"
 *   title="Wellness Score"
 *   value={8.5}
 *   icon={<Heart className="h-5 w-5" />}
 *   trend={{ value: 5.2, isPositive: true }}
 *   subtitle="Above your average"
 *   accentColor="#22c55e"
 * />
 * ```
 */
export const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  (
    {
      title,
      value,
      icon,
      trend,
      subtitle,
      accentColor,
      variant = 'default',
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
      '--stats-accent': effectiveAccentColor,
    } as React.CSSProperties : undefined;

    // Variant-specific class configurations
    const variantClasses = {
      default: {
        container: 'p-6',
        title: 'text-sm',
        value: 'text-3xl',
        icon: 'p-2 rounded-lg',
        iconSize: 'h-5 w-5',
      },
      compact: {
        container: 'p-4',
        title: 'text-xs',
        value: 'text-2xl',
        icon: 'p-1.5 rounded-md',
        iconSize: 'h-4 w-4',
      },
      detailed: {
        container: 'p-6',
        title: 'text-sm',
        value: 'text-4xl',
        icon: 'p-2.5 rounded-lg',
        iconSize: 'h-6 w-6',
      },
    };

    const config = variantClasses[variant];

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles - glassmorphism with semantic colors
          'rounded-xl border border-border bg-card/60 backdrop-blur-md',
          // Hover effect
          'transition-all duration-300 hover:bg-card/80 hover:border-border/80 hover:shadow-lg',
          // Variant-specific padding
          config.container,
          className
        )}
        style={themeStyles}
        {...props}
      >
        {/* Header with title and icon */}
        <div className={cn(
          'flex items-start justify-between',
          variant === 'compact' ? 'mb-2' : 'mb-4'
        )}>
          <h3 className={cn(
            'font-medium text-muted-foreground',
            config.title
          )}>
            {title}
          </h3>
          {icon && (
            <div
              className={cn(
                config.icon,
                'bg-[var(--stats-accent)]/20 text-[var(--stats-accent)]',
                'transition-colors duration-300'
              )}
              style={{
                color: effectiveAccentColor,
                backgroundColor: `${effectiveAccentColor}33`, // 20% opacity
              }}
            >
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<any>, {
                    className: cn(config.iconSize, (icon as any).props?.className),
                  })
                : icon}
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="space-y-2">
          {/* Value */}
          <div className={cn(
            'font-bold text-foreground',
            config.value
          )}>
            {value}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}

          {/* Trend indicator */}
          {trend && (
            <div className="flex items-center gap-1.5 text-sm">
              <span
                className={cn(
                  'font-semibold',
                  trend.isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-muted-foreground">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Detailed variant: Additional visual emphasis */}
        {variant === 'detailed' && (
          <div
            className="mt-4 h-1 rounded-full bg-gradient-to-r from-transparent via-[var(--stats-accent)]/50 to-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, transparent, ${effectiveAccentColor}80, transparent)`,
            }}
          />
        )}
      </div>
    );
  }
);

StatsCard.displayName = 'StatsCard';
