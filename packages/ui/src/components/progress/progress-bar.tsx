'use client';

import { cn } from '../../lib/utils';
import { useAppColors } from '@ainexsuite/theme';

export interface ProgressBarProps {
  /** Progress value (0-100) - optional when indeterminate is true */
  value?: number;
  /** Maximum value (defaults to 100) */
  max?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'gradient' | 'striped';
  /** Custom color (hex) - overrides accentColor */
  color?: string;
  /** Show label with percentage */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: 'inside' | 'outside' | 'tooltip';
  /** Custom className */
  className?: string;
  /** Indeterminate state (pulsing animation) */
  indeterminate?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  color,
  showLabel = false,
  labelPosition = 'outside',
  className,
  indeterminate = false,
}: ProgressBarProps) {
  const { primary: accentColor } = useAppColors();
  const fillColor = color || accentColor;

  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, ((value || 0) / max) * 100));
  const displayValue = Math.round(percentage);

  // Size classes
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  // Label size classes
  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && labelPosition === 'outside' && (
        <div className={cn('flex justify-between mb-1', labelSizeClasses[size])}>
          <span className="text-muted-foreground">{displayValue}%</span>
        </div>
      )}

      <div
        className={cn(
          'w-full rounded-full overflow-hidden bg-foreground/5 backdrop-blur-sm border border-border',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : (value || 0)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={indeterminate ? 'Loading' : `${displayValue}% complete`}
      >
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out relative',
            {
              'bg-gradient-to-r from-transparent via-foreground/20 to-transparent animate-pulse':
                indeterminate,
              'progress-bar': !indeterminate && variant === 'default',
            }
          )}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
            backgroundColor: indeterminate ? fillColor : undefined,
            backgroundImage:
              !indeterminate && variant === 'gradient'
                ? `linear-gradient(90deg, ${fillColor}dd, ${fillColor})`
                : !indeterminate && variant === 'striped'
                ? `linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)`
                : !indeterminate
                ? fillColor
                : undefined,
            backgroundSize: variant === 'striped' ? '1rem 1rem' : undefined,
          }}
        >
          {/* Animated shimmer for striped variant */}
          {variant === 'striped' && !indeterminate && (
            <div className="absolute inset-0 bg-[length:1rem_1rem] animate-[pulse_2s_linear_infinite]" />
          )}

          {/* Inside label */}
          {showLabel && labelPosition === 'inside' && percentage > 15 && (
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-end pr-2 font-medium text-foreground',
                labelSizeClasses[size]
              )}
            >
              {displayValue}%
            </div>
          )}
        </div>
      </div>

      {/* Tooltip label */}
      {showLabel && labelPosition === 'tooltip' && (
        <div className="relative">
          <div
            className={cn(
              'absolute top-2 bg-background/90 text-foreground px-2 py-1 rounded text-xs font-medium',
              'pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity border border-border'
            )}
            style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
          >
            {displayValue}%
          </div>
        </div>
      )}
    </div>
  );
}
