'use client';

import { cn } from '../../lib/utils';
import { useAppColors } from '@ainexsuite/theme';
import { LucideIcon, Flame } from 'lucide-react';
import { ReactNode } from 'react';

export interface StreakProgressProps {
  /** Current value */
  current: number;
  /** Target value */
  target: number;
  /** Label text */
  label: string;
  /** Icon component */
  icon?: LucideIcon;
  /** Custom icon element */
  iconElement?: ReactNode;
  /** Custom color (hex) - overrides accentColor */
  color?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show celebration animation when complete */
  celebrateOnComplete?: boolean;
  /** Custom className */
  className?: string;
  /** Custom unit text (e.g., "days", "workouts") */
  unit?: string;
  /** Show progress percentage */
  showPercentage?: boolean;
}

export function StreakProgress({
  current,
  target,
  label,
  icon: Icon = Flame,
  iconElement,
  color,
  size = 'md',
  celebrateOnComplete = true,
  className,
  unit,
  showPercentage = false,
}: StreakProgressProps) {
  const { primary: accentColor } = useAppColors();
  const fillColor = color || accentColor;

  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  const isComplete = current >= target;

  // Size classes
  const containerPadding = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconContainerSize = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const valueSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const barHeight = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border',
        'bg-foreground/5 backdrop-blur-sm transition-all duration-300',
        containerPadding[size],
        isComplete && celebrateOnComplete && 'animate-pulse',
        className
      )}
      style={{
        boxShadow: isComplete && celebrateOnComplete ? `0 0 20px ${fillColor}40` : undefined,
      }}
    >
      {/* Glow effect when complete */}
      {isComplete && celebrateOnComplete && (
        <div
          className="absolute inset-0 opacity-20 blur-2xl"
          style={{ backgroundColor: fillColor }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className={cn('rounded-lg flex items-center justify-center', iconContainerSize[size])}
              style={{ backgroundColor: `${fillColor}20` }}
            >
              {iconElement || (
                <Icon className={iconSize[size]} style={{ color: fillColor }} />
              )}
            </div>

            {/* Label */}
            <div>
              <h3 className={cn('font-semibold text-foreground', textSize[size])}>{label}</h3>
              <p className="text-xs text-muted-foreground">
                {current}/{target} {unit || ''}
              </p>
            </div>
          </div>

          {/* Current value display */}
          <div className="text-right">
            <div className={cn('font-bold text-foreground', valueSize[size])}>{current}</div>
            {showPercentage && (
              <div className="text-xs text-muted-foreground">{Math.round(percentage)}%</div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className={cn('relative w-full rounded-full overflow-hidden bg-background/40', barHeight[size])}>
          <div
            className="h-full transition-all duration-500 ease-out relative"
            style={{
              width: `${percentage}%`,
              backgroundImage: `linear-gradient(90deg, ${fillColor}dd, ${fillColor})`,
              boxShadow: `0 0 10px ${fillColor}60`,
            }}
          >
            {/* Animated shimmer */}
            <div
              className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]"
              style={{ animation: isComplete ? 'pulse 2s linear infinite' : undefined }}
            />
          </div>
        </div>

        {/* Motivational message */}
        {isComplete && celebrateOnComplete && (
          <div className="mt-3 text-center">
            <p className={cn('font-medium', textSize[size])} style={{ color: fillColor }}>
              Target achieved! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
