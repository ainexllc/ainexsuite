'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

type EmptyStateVariant = 'default' | 'minimal' | 'illustrated';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Empty state title
   */
  title: string;

  /**
   * Optional description text
   */
  description?: string;

  /**
   * Optional icon component to display
   */
  icon?: LucideIcon;

  /**
   * Optional action button configuration
   */
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };

  /**
   * Visual variant of the empty state
   * @default 'default'
   */
  variant?: EmptyStateVariant;
}

/**
 * EmptyState Component
 *
 * Standardized empty state display for lists and collections.
 * Supports multiple variants and optional call-to-action buttons.
 *
 * Uses consistent styling with glassmorphism and accent color support.
 *
 * @example
 * ```tsx
 * // Default empty state with action
 * <EmptyState
 *   title="No reminders scheduled"
 *   description="Set a reminder from any note to have it appear here."
 *   icon={AlarmClock}
 *   action={{
 *     label: "Create Reminder",
 *     onClick: () => {}
 *   }}
 * />
 *
 * // Minimal variant
 * <EmptyState
 *   title="No items found"
 *   variant="minimal"
 * />
 *
 * // Illustrated variant with link action
 * <EmptyState
 *   title="Start Your Journey"
 *   description="Create your first goal to get started."
 *   icon={Target}
 *   variant="illustrated"
 *   action={{
 *     label: "Create Goal",
 *     href: "/goals/new"
 *   }}
 * />
 * ```
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      title,
      description,
      icon: Icon,
      action,
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: {
        container: 'rounded-3xl border border-dashed border-border bg-muted/50 backdrop-blur-sm px-8 py-12',
        iconSize: 'h-10 w-10',
        titleSize: 'text-base',
        descriptionSize: 'text-sm',
      },
      minimal: {
        container: 'rounded-2xl border border-dashed border-border bg-muted/50 px-4 py-6',
        iconSize: 'h-8 w-8',
        titleSize: 'text-sm',
        descriptionSize: 'text-xs',
      },
      illustrated: {
        container: 'rounded-3xl border-2 border-dashed border-border bg-gradient-to-br from-muted/80 to-muted/50 backdrop-blur-md px-10 py-16',
        iconSize: 'h-12 w-12',
        titleSize: 'text-lg',
        descriptionSize: 'text-base',
      },
    };

    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={cn(styles.container, 'text-center', className)}
        {...props}
      >
        {Icon && (
          <Icon
            className={cn(
              styles.iconSize,
              'mx-auto text-muted-foreground',
              variant === 'illustrated' && 'text-muted-foreground/90'
            )}
            aria-hidden
          />
        )}

        <h3
          className={cn(
            styles.titleSize,
            'font-semibold text-foreground',
            Icon ? 'mt-3' : 'mt-0'
          )}
        >
          {title}
        </h3>

        {description && (
          <p className={cn(styles.descriptionSize, 'mt-1 text-muted-foreground')}>
            {description}
          </p>
        )}

        {action && (
          <div className="mt-6">
            {action.href ? (
              <a
                href={action.href}
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'shadow-lg hover:shadow-xl',
                  variant === 'illustrated' && 'px-6 py-2.5 text-base'
                )}
              >
                {action.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'shadow-lg hover:shadow-xl',
                  variant === 'illustrated' && 'px-6 py-2.5 text-base'
                )}
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
