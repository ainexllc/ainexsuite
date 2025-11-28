'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ListSectionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Section title displayed in the header
   */
  title: string;

  /**
   * Optional count to display next to the title (e.g., number of items)
   */
  count?: number;

  /**
   * Optional icon component to display before the title
   */
  icon?: LucideIcon;

  /**
   * Optional action element (button/link) displayed on the right side of header
   */
  action?: React.ReactNode;

  /**
   * Whether the section can be collapsed/expanded
   * @default false
   */
  collapsible?: boolean;

  /**
   * Default expanded state for collapsible sections
   * @default true
   */
  defaultExpanded?: boolean;

  /**
   * Section content (list items)
   */
  children: React.ReactNode;
}

/**
 * ListSection Component
 *
 * A standardized section wrapper for lists with consistent header styling.
 * Supports optional collapsible behavior, count badges, icons, and action buttons.
 *
 * @example
 * ```tsx
 * <ListSection
 *   title="Active Goals"
 *   count={5}
 *   icon={Target}
 *   collapsible
 *   action={<Button size="sm">Add Goal</Button>}
 * >
 *   <ListItem title="Item 1" />
 *   <ListItem title="Item 2" />
 * </ListSection>
 * ```
 */
export const ListSection = React.forwardRef<HTMLElement, ListSectionProps>(
  (
    {
      title,
      count,
      icon: Icon,
      action,
      collapsible = false,
      defaultExpanded = true,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

    const toggleExpanded = () => {
      if (collapsible) {
        setIsExpanded(!isExpanded);
      }
    };

    const headerContent = (
      <>
        <div className="flex items-center gap-2 flex-1">
          {collapsible && (
            isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            )
          )}
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />}
          <span className="font-semibold tracking-wide">{title}</span>
          {typeof count === 'number' && (
            <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-foreground/10 text-[11px] font-bold text-foreground/70">
              {count}
            </span>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </>
    );

    return (
      <section ref={ref} className={cn('space-y-3', className)} {...props}>
        <header
          className={cn(
            'flex items-center justify-between text-xs uppercase text-muted-foreground',
            collapsible && 'cursor-pointer select-none hover:text-foreground/70 transition-colors'
          )}
          onClick={toggleExpanded}
          role={collapsible ? 'button' : undefined}
          aria-expanded={collapsible ? isExpanded : undefined}
          tabIndex={collapsible ? 0 : undefined}
          onKeyDown={
            collapsible
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpanded();
                  }
                }
              : undefined
          }
        >
          {headerContent}
        </header>

        {(!collapsible || isExpanded) && (
          <div className="space-y-3">{children}</div>
        )}
      </section>
    );
  }
);

ListSection.displayName = 'ListSection';
