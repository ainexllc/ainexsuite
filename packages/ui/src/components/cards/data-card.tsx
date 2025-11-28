'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * DataCard Variants
 * - default: Standard card with header, content, footer
 * - compact: Minimal card for lists
 * - highlighted: With accent border/glow for emphasis
 * - interactive: Enhanced hover effects for clickable cards
 */
export type DataCardVariant = 'default' | 'compact' | 'highlighted' | 'interactive';

/**
 * DataCard Props
 */
export interface DataCardProps {
  /** Card title */
  title?: string;
  /** Optional subtitle/metadata */
  subtitle?: string;
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Card content */
  children?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Optional click handler */
  onClick?: (event: React.MouseEvent) => void;
  /** Optional link (renders as anchor) */
  href?: string;
  /** Optional accent color (hex or CSS color) */
  accentColor?: string;
  /** Card variant */
  variant?: DataCardVariant;
  /** Additional CSS classes */
  className?: string;
  /** Optional badge/tag to display */
  badge?: React.ReactNode;
  /** Optional target for anchor links */
  target?: string;
  /** Optional rel for anchor links */
  rel?: string;
}

/**
 * DataCard Component
 *
 * A flexible card component for displaying content items with multiple variants.
 * Supports both button-like and link rendering with consistent styling.
 *
 * @example
 * ```tsx
 * // Default card
 * <DataCard
 *   title="My Title"
 *   subtitle="Subtitle text"
 *   icon={<Icon />}
 *   footer={<div>Footer content</div>}
 * >
 *   <p>Card content goes here</p>
 * </DataCard>
 *
 * // Interactive card with click handler
 * <DataCard
 *   variant="interactive"
 *   title="Clickable Card"
 *   onClick={() => console.log('clicked')}
 * >
 *   Click me!
 * </DataCard>
 *
 * // Highlighted card with accent color
 * <DataCard
 *   variant="highlighted"
 *   title="Important Item"
 *   accentColor="#f97316"
 *   badge={<span>New</span>}
 * >
 *   This card stands out
 * </DataCard>
 *
 * // Link card
 * <DataCard
 *   variant="interactive"
 *   title="Navigate"
 *   href="/somewhere"
 * >
 *   I'm a link!
 * </DataCard>
 * ```
 */
export const DataCard = React.forwardRef<
  HTMLDivElement | HTMLAnchorElement,
  DataCardProps
>(
  (
    {
      title,
      subtitle,
      icon,
      children,
      footer,
      onClick,
      href,
      accentColor,
      variant = 'default',
      className,
      badge,
      target,
      rel,
    },
    ref
  ) => {
    // Determine if card should be interactive
    const isInteractive = Boolean(onClick || href);
    const isLink = Boolean(href);

    // Base classes shared by all variants
    const baseClasses = cn(
      'relative overflow-hidden transition-all duration-300',
      'bg-card/60 backdrop-blur-xl border border-border text-card-foreground',
      className
    );

    // Variant-specific classes
    const variantClasses = {
      default: cn(
        'rounded-xl',
        isInteractive && 'cursor-pointer hover:border-border/80 hover:shadow-2xl'
      ),
      compact: cn(
        'rounded-lg',
        isInteractive && 'cursor-pointer hover:border-border/70 hover:shadow-lg'
      ),
      highlighted: cn(
        'rounded-2xl',
        'shadow-lg',
        isInteractive && 'cursor-pointer hover:shadow-2xl'
      ),
      interactive: cn(
        'rounded-xl',
        'cursor-pointer hover:border-border/80 hover:shadow-2xl',
        'hover:scale-[1.01] active:scale-[0.99]'
      ),
    };

    // Padding based on variant
    const paddingClasses = {
      default: 'px-6 py-6',
      compact: 'px-4 py-3',
      highlighted: 'px-6 py-6',
      interactive: 'px-6 py-6',
    };

    // Accent styles for highlighted variant
    const accentStyles: React.CSSProperties = {};
    if (variant === 'highlighted' && accentColor) {
      accentStyles.borderColor = `${accentColor}30`;
      accentStyles.boxShadow = `0 0 20px ${accentColor}20`;
    }

    // Footer background color
    const footerStyles: React.CSSProperties = {};
    if (accentColor && footer) {
      footerStyles.backgroundColor = `${accentColor}1a`;
    }

    // Handle click events
    const handleClick = (event: React.MouseEvent) => {
      if (onClick) {
        onClick(event);
      }
    };

    // Render as link if href is provided
    if (isLink) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel}
          className={cn(
            baseClasses,
            variantClasses[variant],
            'block group'
          )}
          style={accentStyles}
          onClick={handleClick}
        >
          <div className={paddingClasses[variant]}>
            {renderCardContent()}
          </div>
          {footer && renderFooter()}
        </a>
      );
    }

    // Render as div (with optional click handler)
    return (
      <article
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          baseClasses,
          variantClasses[variant],
          'group'
        )}
        style={accentStyles}
        onClick={isInteractive ? handleClick : undefined}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={
          isInteractive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(e as any);
                }
              }
            : undefined
        }
      >
        <div className={paddingClasses[variant]}>
          {renderCardContent()}
        </div>
        {footer && renderFooter()}
      </article>
    );

    // Render card content (header + children)
    function renderCardContent() {
      // Background glow for highlighted variant
      const glow = variant === 'highlighted' && accentColor && (
        <div
          className="absolute -top-10 -right-10 w-32 h-32 blur-3xl rounded-full pointer-events-none"
          style={{ backgroundColor: `${accentColor}20` }}
        />
      );

      return (
        <>
          {glow}
          <div className="relative z-10">
            {/* Header with icon, title, subtitle, and badge */}
            {(icon || title || subtitle || badge) && (
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Icon */}
                  {icon && (
                    <div
                      className={cn(
                        'flex-shrink-0',
                        variant === 'compact' ? 'mt-0.5' : 'mt-1',
                        accentColor && variant === 'highlighted' && 'text-foreground'
                      )}
                      style={
                        accentColor && variant === 'highlighted'
                          ? { color: accentColor }
                          : undefined
                      }
                    >
                      {icon}
                    </div>
                  )}

                  {/* Title and subtitle */}
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h3
                        className={cn(
                          'font-semibold text-foreground',
                          variant === 'compact' ? 'text-sm' : 'text-base',
                          subtitle && 'mb-1'
                        )}
                      >
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p
                        className={cn(
                          'text-muted-foreground',
                          variant === 'compact' ? 'text-xs' : 'text-sm'
                        )}
                      >
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Badge */}
                {badge && (
                  <div className="flex-shrink-0">
                    {badge}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            {children && (
              <div
                className={cn(
                  'text-muted-foreground',
                  variant === 'compact' ? 'text-sm' : 'text-base'
                )}
              >
                {children}
              </div>
            )}
          </div>
        </>
      );
    }

    // Render footer
    function renderFooter() {
      return (
        <footer
          className={cn(
            'flex items-center justify-between px-6 pb-4 pt-3 -mt-2 rounded-b-xl',
            variant === 'compact' && 'px-4 pb-3 pt-2 rounded-b-lg',
            variant === 'highlighted' && 'rounded-b-2xl',
            !accentColor && 'bg-muted'
          )}
          style={footerStyles}
        >
          {footer}
        </footer>
      );
    }
  }
);

DataCard.displayName = 'DataCard';
