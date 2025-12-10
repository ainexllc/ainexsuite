'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbItem } from '@ainexsuite/types';

/**
 * HeaderBreadcrumbs Component
 *
 * Compact breadcrumb navigation for the workspace header.
 * Automatically truncates middle items if the list is too long.
 */

export interface HeaderBreadcrumbsProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Maximum visible items before truncating (default: 3) */
  maxVisible?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show home icon for first item */
  showHomeIcon?: boolean;
}

export function HeaderBreadcrumbs({
  items,
  maxVisible = 3,
  className = '',
  showHomeIcon = true,
}: HeaderBreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  // Determine which items to show
  const shouldTruncate = items.length > maxVisible;
  let visibleItems: (BreadcrumbItem | 'ellipsis')[] = [];

  if (shouldTruncate) {
    // Show first item, ellipsis, and last (maxVisible - 1) items
    visibleItems = [
      items[0],
      'ellipsis',
      ...items.slice(-(maxVisible - 1)),
    ];
  } else {
    visibleItems = items;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`hidden lg:flex items-center gap-1 text-sm ${className}`}
    >
      {visibleItems.map((item, index) => {
        if (item === 'ellipsis') {
          return (
            <React.Fragment key="ellipsis">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" aria-hidden />
              <span className="text-muted-foreground px-1">...</span>
            </React.Fragment>
          );
        }

        const isFirst = index === 0;
        const isLast = index === visibleItems.length - 1;
        const showSeparator = !isLast;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {item.href && !item.current ? (
              <a
                href={item.href}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]"
                title={item.label}
              >
                {isFirst && showHomeIcon ? (
                  <Home className="h-3.5 w-3.5 shrink-0" aria-hidden />
                ) : null}
                <span className="truncate">{item.label}</span>
              </a>
            ) : (
              <span
                className={`flex items-center gap-1 truncate max-w-[120px] ${
                  item.current
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
                aria-current={item.current ? 'page' : undefined}
                title={item.label}
              >
                {isFirst && showHomeIcon ? (
                  <Home className="h-3.5 w-3.5 shrink-0" aria-hidden />
                ) : null}
                <span className="truncate">{item.label}</span>
              </span>
            )}
            {showSeparator && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" aria-hidden />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
