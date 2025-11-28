'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppColors } from '@ainexsuite/theme';

/**
 * Breadcrumb item for navigation trails
 */
export interface Breadcrumb {
  /** Display label */
  label: string;
  /** Optional link URL. If provided, breadcrumb is clickable */
  href?: string;
}

/**
 * Props for the PageHeader component
 */
export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Main page title */
  title: string;
  /** Optional subtitle/description below the title */
  subtitle?: string;
  /** Navigation breadcrumbs array */
  breadcrumbs?: Breadcrumb[];
  /** Actions to display on the right side (buttons, etc.) */
  actions?: React.ReactNode;
  /** URL for back button. If provided, shows a back button */
  backHref?: string;
  /** Optional icon to display next to title */
  icon?: React.ReactNode;
  /** Accent color override (hex). Falls back to app theme primary */
  accentColor?: string;
  /** Whether header should stick to top of page */
  sticky?: boolean;
  /** Title size variant */
  size?: 'default' | 'large';
  /** Additional CSS classes */
  className?: string;
}

/**
 * PageHeader - Full page header with title, breadcrumbs, and actions
 *
 * A comprehensive header component for top-level pages with navigation breadcrumbs,
 * back buttons, and action areas. Supports sticky positioning and glassmorphism styling.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PageHeader
 *   title="My Projects"
 *   subtitle="Manage all your active projects"
 * />
 *
 * // With breadcrumbs and actions
 * <PageHeader
 *   title="Project Details"
 *   breadcrumbs={[
 *     { label: "Home", href: "/" },
 *     { label: "Projects", href: "/projects" },
 *     { label: "Project #123" }
 *   ]}
 *   actions={
 *     <button className="btn-primary">Create New</button>
 *   }
 * />
 *
 * // With back button and icon
 * <PageHeader
 *   title="Settings"
 *   backHref="/dashboard"
 *   icon={<Settings className="h-8 w-8" />}
 *   sticky
 *   size="large"
 * />
 * ```
 */
export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      title,
      subtitle,
      breadcrumbs,
      actions,
      backHref,
      icon,
      accentColor,
      sticky = false,
      size = 'default',
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
      '--page-header-accent': effectiveAccentColor,
    } as React.CSSProperties : undefined;

    const titleSizes = {
      default: 'text-2xl md:text-3xl',
      large: 'text-3xl md:text-4xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'w-full',
          // Sticky positioning
          sticky && 'sticky top-0 z-20 backdrop-blur-md bg-black/20 border-b border-white/10',
          className
        )}
        style={themeStyles}
        {...props}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <li key={index} className="flex items-center gap-2">
                      {crumb.href && !isLast ? (
                        <Link
                          href={crumb.href}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className={cn(
                          isLast ? 'text-white font-medium' : 'text-white/60'
                        )}>
                          {crumb.label}
                        </span>
                      )}
                      {!isLast && (
                        <ChevronRight className="h-4 w-4 text-white/40" />
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          {/* Main header content */}
          <div className="flex items-start justify-between gap-4">
            {/* Left: Back button + Icon + Title */}
            <div className="flex items-start gap-4 min-w-0 flex-1">
              {/* Back button */}
              {backHref && (
                <Link
                  href={backHref}
                  className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5 text-white/70" />
                </Link>
              )}

              {/* Icon */}
              {icon && (
                <div
                  className="flex-shrink-0 flex items-center justify-center p-2 rounded-lg"
                  style={{
                    backgroundColor: `${effectiveAccentColor}20`,
                    color: effectiveAccentColor,
                  }}
                >
                  {icon}
                </div>
              )}

              {/* Title and subtitle */}
              <div className="min-w-0 flex-1">
                <h1 className={cn(
                  'font-bold text-white',
                  titleSizes[size]
                )}>
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-sm md:text-base text-white/60">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            {actions && (
              <div className="flex-shrink-0 flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';
