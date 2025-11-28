'use client';

import { cn } from '../../lib/utils';
import { useAppColors } from '@ainexsuite/theme';
import { ReactNode } from 'react';

export interface ProgressRingProps {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value (defaults to 100) */
  max?: number;
  /** Size in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Custom color (hex) - overrides accentColor */
  color?: string;
  /** Show value in center */
  showValue?: boolean;
  /** Custom center content */
  children?: ReactNode;
  /** Custom className */
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color,
  showValue = true,
  children,
  className,
}: ProgressRingProps) {
  const { primary: accentColor } = useAppColors();
  const fillColor = color || accentColor;

  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const displayValue = Math.round(percentage);

  // SVG calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${displayValue}% complete`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${fillColor}80)`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          showValue && (
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{displayValue}%</div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
